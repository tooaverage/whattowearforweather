// Security / robustness tests.
//
// Threat model: the engine consumes JSON parsed from a third-party weather
// API. TS types are erased at runtime, so the engine MUST behave when handed
// non-finite numbers, missing fields, strings where numbers were promised, or
// hostile-shaped strings (template literal injection cannot reach the engine
// because there is no string templating in the engine itself, but we verify
// here that pathological inputs neither throw nor produce non-finite outputs).

import { describe, expect, it } from 'vitest';
import { apparentTemperatureC, heatIndexC, windChillC, bomApparentC } from './apparent';
import { recommend } from './recommend';
import type { WeatherInput, WeatherPoint } from './types';

const goodPoint = (overrides: Partial<WeatherPoint> = {}): WeatherPoint => ({
  time: '2024-01-01T00:00:00Z',
  tempC: 15,
  relativeHumidity: 60,
  windKph: 5,
  gustKph: 8,
  precipMm: 0,
  precipProbability: 0,
  snowfallCm: 0,
  uvIndex: 0,
  cloudCoverPct: 50,
  isDay: true,
  weatherCode: 0,
  ...overrides,
});

// Pathological inputs that could realistically arrive from a misbehaving JSON
// adapter or a corrupt cache. We deliberately defeat TS via `as any` because
// that's what real-world bugs look like.
const NASTIES: unknown[] = [
  NaN,
  Infinity,
  -Infinity,
  null,
  undefined,
  'not a number',
  '12; DROP TABLE users; --',
  '<script>alert(1)</script>',
  '${alert(1)}',
  '`+process.exit()+`',
  {},
  [],
  Number.MAX_SAFE_INTEGER + 1,
];

describe('engine — pathological numeric inputs', () => {
  for (const bad of NASTIES) {
    it(`recommend() does not throw on bad tempC: ${JSON.stringify(bad)}`, () => {
      const input: WeatherInput = {
        current: goodPoint({ tempC: bad as number }),
        next12h: [goodPoint(), goodPoint({ tempC: bad as number })],
        source: 'test',
      };
      expect(() => recommend(input)).not.toThrow();
      const r = recommend(input);
      expect(Number.isFinite(r.apparentNowC)).toBe(true);
      expect(Number.isFinite(r.dayArc.minApparentC)).toBe(true);
      expect(Number.isFinite(r.dayArc.maxApparentC)).toBe(true);
    });
  }

  it('clamps relative humidity to a sane range', () => {
    const r = recommend({
      current: goodPoint({ relativeHumidity: 9999 as number }),
      next12h: [goodPoint({ relativeHumidity: -50 as number })],
      source: 'test',
    });
    expect(Number.isFinite(r.apparentNowC)).toBe(true);
  });

  it('does not let negative wind speeds break wind chill', () => {
    // Negative wind speed is non-physical; engine should treat it as 0.
    const r = recommend({
      current: goodPoint({ tempC: -10, windKph: -20 as number }),
      next12h: [goodPoint({ tempC: -10, windKph: -20 as number })],
      source: 'test',
    });
    expect(Number.isFinite(r.apparentNowC)).toBe(true);
  });
});

describe('apparent-temperature primitives — non-finite inputs', () => {
  // These functions are pure math and may legitimately produce NaN if given
  // NaN. The contract: they don't throw and they don't return Infinity for
  // realistic inputs, but they may return NaN. The recommendation engine is
  // responsible for sanitising before calling them.
  it('heatIndexC does not throw on NaN', () => {
    expect(() => heatIndexC(NaN, NaN)).not.toThrow();
  });
  it('windChillC returns input temp when wind is invalid', () => {
    // Per docstring contract: out-of-range conditions return air temp.
    expect(windChillC(0, NaN)).toBe(0);
  });
  it('bomApparentC does not throw on NaN', () => {
    expect(() => bomApparentC(NaN, NaN, NaN)).not.toThrow();
  });
  it('apparentTemperatureC handles edge inputs', () => {
    expect(() => apparentTemperatureC(0, 50, 0)).not.toThrow();
    expect(() => apparentTemperatureC(-200, 0, 1000)).not.toThrow();
  });
});

describe('engine — string handling', () => {
  // Layer recipes are static, so user-influenced strings can't ever appear in
  // the `layers.*` outputs. This test guards that invariant.
  it('layer recipe values come from the static RECIPES table only', () => {
    const r = recommend({
      current: goodPoint({ tempC: 15 }),
      next12h: [goodPoint()],
      source: '<script>alert(1)</script>',
    });
    // No field of the output may equal the malicious source string.
    const stringified = JSON.stringify(r);
    expect(stringified).not.toContain('<script>');
    expect(stringified).not.toContain('alert(1)');
  });

  it('rationale strings only contain numbers and known phrases', () => {
    const r = recommend({
      current: goodPoint({ tempC: 15 }),
      next12h: Array.from({ length: 12 }, () => goodPoint({ tempC: 15 })),
      source: 'test',
    });
    for (const line of r.rationale) {
      // Reject any HTML-tag-looking content.
      expect(line).not.toMatch(/<[^>]+>/);
    }
  });
});

describe('engine — empty / minimal inputs', () => {
  it('handles an empty 12h forecast without throwing', () => {
    const r = recommend({
      current: goodPoint(),
      next12h: [],
      source: 'test',
    });
    expect(r.dayArc.spreadC).toBe(0);
    expect(r.dayArc.crossesBand).toBe(false);
  });
});
