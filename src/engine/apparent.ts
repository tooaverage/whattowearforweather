// Apparent-temperature formulas.
//
// Three published formulas, one chooser:
//
//   - NWS Heat Index (Rothfusz 1990 regression of Steadman 1979) for T ≳ 27°C.
//     https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
//
//   - NWS Wind Chill (Osczevski/Bluestein 2001) for T ≤ 10°C, V > 4.8 km/h.
//     https://www.weather.gov/safety/cold-wind-chill-chart
//
//   - BOM Apparent Temperature (Steadman 1994) for the in-between range.
//     http://www.bom.gov.au/info/thermal_stress/
//
// All inputs/outputs in metric (°C, km/h). Internal NWS formulas operate in
// °F / mph, so we convert at the boundary.

import { DEFAULT_CONFIG, type Config } from './config';

const C_TO_F = (c: number) => c * 9 / 5 + 32;
const F_TO_C = (f: number) => (f - 32) * 5 / 9;
const KPH_TO_MPH = (k: number) => k * 0.621371;
const KPH_TO_MS = (k: number) => k / 3.6;

/**
 * NWS Heat Index in °C.
 *
 * Implements the published procedure exactly:
 *   1. Compute the simple Steadman approximation, average with T.
 *   2. If the result is < 80°F, return that.
 *   3. Otherwise apply the full Rothfusz regression and any humidity
 *      adjustments documented by NWS.
 */
export function heatIndexC(tempC: number, relativeHumidity: number): number {
  const T = C_TO_F(tempC);
  const RH = relativeHumidity;

  // Simple Steadman formula (used for HI < 80°F).
  const simple = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
  const simpleAvg = (simple + T) / 2;
  if (simpleAvg < 80) return F_TO_C(simpleAvg);

  // Rothfusz regression.
  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  // Low-humidity adjustment.
  if (RH < 13 && T >= 80 && T <= 112) {
    const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adj;
  }
  // High-humidity adjustment.
  if (RH > 85 && T >= 80 && T <= 87) {
    const adj = ((RH - 85) / 10) * ((87 - T) / 5);
    HI += adj;
  }

  return F_TO_C(HI);
}

/**
 * NWS Wind Chill in °C. Returns the air temperature unchanged when the
 * formula's validity range (T ≤ 10°C, V > 4.8 km/h) is not met.
 */
export function windChillC(tempC: number, windKph: number, cfg: Config = DEFAULT_CONFIG): number {
  if (tempC > cfg.windChillTempC || windKph <= cfg.windChillMinWindKph) return tempC;
  const T = C_TO_F(tempC);
  const V = KPH_TO_MPH(windKph);
  const V16 = Math.pow(V, 0.16);
  const WC = 35.74 + 0.6215 * T - 35.75 * V16 + 0.4275 * T * V16;
  return F_TO_C(WC);
}

/**
 * BOM Apparent Temperature in °C, no-radiation form:
 *
 *   AT = Ta + 0.33 e − 0.70 ws − 4.00
 *
 * with vapor pressure
 *
 *   e = (RH/100) × 6.105 × exp((17.27 × Ta) / (237.7 + Ta))
 *
 * Wind speed `ws` is in m/s at 10 m. Source: Steadman 1994,
 *   http://www.bom.gov.au/info/thermal_stress/
 */
export function bomApparentC(tempC: number, relativeHumidity: number, windKph: number): number {
  const Ta = tempC;
  const RH = relativeHumidity;
  const ws = KPH_TO_MS(windKph);
  const e = (RH / 100) * 6.105 * Math.exp((17.27 * Ta) / (237.7 + Ta));
  return Ta + 0.33 * e - 0.70 * ws - 4.00;
}

/**
 * Pick the right apparent-temperature formula for the conditions and return
 * the result in °C. Used by the recommendation engine.
 */
export function apparentTemperatureC(
  tempC: number,
  relativeHumidity: number,
  windKph: number,
  cfg: Config,
): number {
  if (tempC <= cfg.windChillTempC && windKph > cfg.windChillMinWindKph) {
    return windChillC(tempC, windKph, cfg);
  }
  if (tempC >= cfg.heatIndexTempC) {
    return heatIndexC(tempC, relativeHumidity);
  }
  return bomApparentC(tempC, relativeHumidity, windKph);
}
