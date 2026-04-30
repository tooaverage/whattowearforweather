// Tunable thresholds and offsets for the recommendation engine.
//
// All values here are intentionally surfaced (rather than hardcoded inside the
// logic functions) so they can be calibrated without touching engine code.
// Sources are cited inline. When you change a number, update its rationale.

import type { Activity, Band, ThermalBaseline } from './types';

export interface BandThreshold {
  band: Band;
  /**
   * Inclusive lower bound on engine-effective temperature (°C). The first band
   * whose `minEffectiveC` is at or below the effective temperature wins, when
   * scanning from hottest to coldest.
   */
  minEffectiveC: number;
}

export interface Config {
  /**
   * Body-comfort offset applied to apparent temperature.
   * Positive values mean the engine treats it as warmer than it actually is,
   * which produces *cooler* clothing recommendations. The offsets here are
   * deliberately small until we have personalisation data.
   */
  baselineOffsets: Record<ThermalBaseline, number>;

  /**
   * Activity offset applied to apparent temperature, accounting for metabolic
   * heat. A walking commute generates ~3 METs vs. ~1 MET for standing, which
   * is roughly +3°C of perceived warmth in cool conditions (Steadman 1979,
   * "The assessment of sultriness, Part I"; ASHRAE 55 PMV model).
   */
  activityOffsets: Record<Activity, number>;

  /**
   * Layering bands ordered hottest → coldest. Effective temperatures at or
   * above `minEffectiveC` map to that band.
   *
   * Ranges roughly correspond to REI's layering guidance:
   *   https://www.rei.com/learn/expert-advice/layering-basics.html
   * with the cold-end split adapted from clo-value tables in:
   *   ISO 7730 / ASHRAE 55 (basic clo for typical garments)
   */
  bands: BandThreshold[];

  /**
   * Wind speed (km/h) above which the engine treats wind as a first-class
   * comfort factor and recommends a wind-resistant outer layer regardless of
   * the temperature band. ~16 km/h ≈ 10 mph; sports-medicine literature on
   * convective heat loss treats this as the rough boundary at which wind
   * begins to materially affect perceived warmth (e.g., Pugh 1966).
   */
  windLayerKph: number;

  /**
   * Air temperature (°C) at or below which we use NWS Wind Chill instead of
   * BOM AT for apparent temperature. NWS publishes the formula as valid for
   * T ≤ 50°F (10°C) and V > 3 mph (4.8 km/h).
   *   https://www.weather.gov/safety/cold-wind-chill-chart
   */
  windChillTempC: number;
  /** Wind speed (km/h) below which NWS Wind Chill is not applied. */
  windChillMinWindKph: number;

  /**
   * Air temperature (°C) at or above which we use NWS Heat Index instead of
   * BOM AT. NWS publishes the regression as valid for T ≥ 80°F (26.7°C) and
   * RH ≥ 40%, but the simple Steadman fallback is well-defined down to ~70°F.
   *   https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
   */
  heatIndexTempC: number;

  /**
   * Probability (%) of precipitation in the next 12h that triggers a rain
   * shell recommendation. 40% is a common "more likely than not over the
   * window" threshold used in commercial weather apps.
   */
  rainShellProbabilityPct: number;
  /** Total expected precipitation (mm) over the window that also triggers a shell. */
  rainShellTotalMm: number;
  /** Probability (%) at which we suggest carrying an umbrella but stop short of a shell. */
  umbrellaProbabilityPct: number;

  /** UV index at or above which we recommend sunglasses + hat. WHO standard: 3+. */
  uvProtectionIndex: number;
  /** UV index at or above which we add a sunscreen reminder. WHO standard: 6+ ("high"). */
  uvSunscreenIndex: number;

  /**
   * Apparent temperature spread (°C) over the 12h window that triggers the
   * "bring a layer to shed/add" callout, even if no band boundary is crossed.
   * 5°C is a rule of thumb roughly equal to one clo step in the cold half of
   * the comfort range.
   */
  bringLayerSpreadC: number;

  /** Snowfall (cm) in the next 12h above which we recommend waterproof boots. */
  snowBootCm: number;
}

export const DEFAULT_CONFIG: Config = {
  baselineOffsets: {
    neutral: 0,
    runs_cold: 3, // shift everything ~3°C warmer-feeling → recommends ~one band warmer
    runs_warm: -3,
  },
  activityOffsets: {
    walking_commute: 1.5, // modest metabolic boost, dampened because v1 is generic
    sedentary_outdoor: 0,
  },
  bands: [
    { band: 'hot', minEffectiveC: 27 },
    { band: 'warm', minEffectiveC: 20 },
    { band: 'mild', minEffectiveC: 14 },
    { band: 'cool', minEffectiveC: 8 },
    { band: 'cold', minEffectiveC: 2 },
    { band: 'very_cold', minEffectiveC: -5 },
    { band: 'freezing', minEffectiveC: -Infinity },
  ],
  windLayerKph: 16,
  windChillTempC: 10,
  windChillMinWindKph: 4.8,
  heatIndexTempC: 26.7,
  rainShellProbabilityPct: 40,
  rainShellTotalMm: 1.0,
  umbrellaProbabilityPct: 10,
  uvProtectionIndex: 3,
  uvSunscreenIndex: 6,
  bringLayerSpreadC: 5,
  snowBootCm: 0.5,
};
