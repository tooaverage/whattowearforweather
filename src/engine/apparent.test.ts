import { describe, expect, it } from 'vitest';
import { apparentTemperatureC, bomApparentC, heatIndexC, windChillC } from './apparent';
import { DEFAULT_CONFIG } from './config';

// Reference values are taken from the published charts on weather.gov / BOM.
// We allow ~1°C of slack because the engine carries every formula at full
// precision while the reference charts round at integer °F / °C.

describe('NWS Heat Index', () => {
  // NWS heat index chart at https://www.weather.gov/safety/heat-index
  // 90°F (32.2°C), 70% RH → HI ~ 105°F (40.6°C)
  it('matches the NWS chart at 90°F / 70% RH', () => {
    expect(heatIndexC(32.2, 70)).toBeCloseTo(40.6, 0);
  });

  // 100°F (37.8°C), 50% RH → HI ~ 119°F (48.3°C)
  it('matches the NWS chart at 100°F / 50% RH', () => {
    expect(heatIndexC(37.8, 50)).toBeCloseTo(48.3, 0);
  });

  // Below 80°F the simple formula returns ≈ T when humidity is moderate.
  it('falls back to ≈ T below 80°F at moderate humidity', () => {
    const hi = heatIndexC(25, 50);
    expect(Math.abs(hi - 25)).toBeLessThan(2);
  });
});

describe('NWS Wind Chill', () => {
  // NWS wind-chill chart: 20°F (-6.7°C), 20 mph (32.2 km/h) → WC ~ 4°F (-15.6°C)
  it('matches the NWS chart at -6.7°C / 32 km/h', () => {
    expect(windChillC(-6.7, 32.2)).toBeCloseTo(-15.6, 0);
  });

  // Out of range (T > 10°C) → returns air temp unchanged.
  it('returns air temp when temp is above the validity threshold', () => {
    expect(windChillC(15, 30, DEFAULT_CONFIG)).toBe(15);
  });

  it('returns air temp when wind is below the validity threshold', () => {
    expect(windChillC(0, 1, DEFAULT_CONFIG)).toBe(0);
  });
});

// `windChillC` ergonomics: the engine version takes a Config; provide tests
// for both signatures.
function windChillCWithConfig(t: number, v: number) {
  return windChillC(t, v, DEFAULT_CONFIG);
}

describe('NWS Wind Chill via engine config', () => {
  it('honours the config thresholds', () => {
    // Right at the validity edge: T = 10°C, V = 5 km/h → formula applies, slightly cooler.
    const wc = windChillCWithConfig(10, 5);
    expect(wc).toBeLessThan(10);
  });
});

describe('BOM Apparent Temperature', () => {
  // Spot-check with hand calculation:
  //   Ta=20, RH=50, ws_kph=10  →  ws_ms=2.78,  e ≈ 11.69 hPa
  //   AT ≈ 20 + 0.33*11.69 - 0.70*2.78 - 4 = 20 + 3.86 - 1.94 - 4 ≈ 17.91
  it('matches a hand calculation in the mild range', () => {
    expect(bomApparentC(20, 50, 10)).toBeCloseTo(17.91, 1);
  });

  // Higher humidity should always raise AT relative to lower humidity (warm range).
  it('rises with humidity in warm conditions', () => {
    const dry = bomApparentC(28, 30, 5);
    const humid = bomApparentC(28, 80, 5);
    expect(humid).toBeGreaterThan(dry);
  });

  // More wind should always lower AT.
  it('falls with wind speed', () => {
    const calm = bomApparentC(15, 60, 0);
    const breezy = bomApparentC(15, 60, 30);
    expect(breezy).toBeLessThan(calm);
  });
});

describe('apparentTemperatureC chooser', () => {
  it('uses wind chill for cold + windy', () => {
    const v = apparentTemperatureC(-5, 60, 25, DEFAULT_CONFIG);
    // Wind chill at -5°C / 25 km/h is around -11°C.
    expect(v).toBeLessThan(-8);
  });

  it('uses heat index for hot + humid', () => {
    const v = apparentTemperatureC(32, 70, 5, DEFAULT_CONFIG);
    // BOM AT would be ~33°C; HI is meaningfully higher.
    expect(v).toBeGreaterThan(35);
  });

  it('uses BOM AT in the in-between range', () => {
    const v = apparentTemperatureC(18, 60, 12, DEFAULT_CONFIG);
    const bom = bomApparentC(18, 60, 12);
    expect(v).toBeCloseTo(bom, 5);
  });
});
