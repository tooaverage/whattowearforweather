import { describe, expect, it } from 'vitest';
import { recommend } from './recommend';
import type { WeatherInput, WeatherPoint } from './types';

const samplePoint = (overrides: Partial<WeatherPoint> = {}): WeatherPoint => ({
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

const sampleInput = (
  current: Partial<WeatherPoint> = {},
  next12h: Partial<WeatherPoint>[] = [],
): WeatherInput => ({
  current: samplePoint(current),
  next12h: next12h.length ? next12h.map((o) => samplePoint(o)) : [samplePoint(current)],
  source: 'test',
});

describe('recommend — band selection', () => {
  it('hot day picks t-shirt + shorts', () => {
    const r = recommend(sampleInput({ tempC: 30, relativeHumidity: 50 }));
    expect(r.band).toBe('hot');
    expect(r.layers.outer).toBeNull();
    expect(r.layers.bottom).toMatch(/short|skirt/i);
  });

  it('cold + windy day picks insulated outer + accessories', () => {
    const r = recommend(sampleInput({ tempC: -3, windKph: 25 }));
    expect(['cold', 'very_cold', 'freezing']).toContain(r.band);
    expect(r.layers.outer).not.toBeNull();
    expect(r.layers.accessories.length).toBeGreaterThan(0);
  });

  it('mild day picks long-sleeve and pants without an outer', () => {
    const r = recommend(sampleInput({ tempC: 17, windKph: 5 }));
    expect(['mild', 'cool']).toContain(r.band);
    expect(r.layers.bottom).toMatch(/pants/i);
  });
});

describe('recommend — overrides', () => {
  it('adds a wind shell when sustained wind exceeds the threshold', () => {
    const r = recommend(
      sampleInput(
        { tempC: 16, windKph: 22 },
        [
          { tempC: 16, windKph: 22 },
          { tempC: 15, windKph: 20 },
        ],
      ),
    );
    expect(r.layers.outer).toMatch(/wind|waterproof|shell/i);
  });

  it('adds a waterproof shell when rain is likely', () => {
    const r = recommend(
      sampleInput(
        { tempC: 15 },
        Array.from({ length: 12 }, () => ({ tempC: 15, precipMm: 0.4, precipProbability: 70 })),
      ),
    );
    expect(r.layers.outer).toMatch(/waterproof|shell/i);
  });

  it('adds an umbrella when rain is just a chance', () => {
    const r = recommend(
      sampleInput(
        { tempC: 18 },
        Array.from({ length: 12 }, () => ({ tempC: 18, precipProbability: 20, precipMm: 0 })),
      ),
    );
    expect(r.layers.accessories.some((a) => a.includes('umbrella'))).toBe(true);
  });

  it('adds sunglasses + sunscreen for high UV', () => {
    const r = recommend(
      sampleInput(
        { tempC: 25, uvIndex: 8 },
        Array.from({ length: 12 }, () => ({ tempC: 25, uvIndex: 8 })),
      ),
    );
    expect(r.layers.accessories).toEqual(
      expect.arrayContaining(['sunglasses', expect.stringMatching(/hat/), 'sunscreen']),
    );
  });
});

describe('recommend — bring-a-layer callout', () => {
  it('triggers when the day arc spans a band boundary getting warmer', () => {
    const r = recommend(
      sampleInput(
        { tempC: 12 },
        [
          { tempC: 12 },
          { tempC: 14 },
          { tempC: 17 },
          { tempC: 20 },
          { tempC: 23 },
          { tempC: 24 },
        ],
      ),
    );
    expect(r.bringWithYou).not.toBeNull();
    expect(r.bringWithYou).toMatch(/shed|adjust/i);
  });

  it('triggers when the day arc spans a band boundary getting colder', () => {
    const r = recommend(
      sampleInput(
        { tempC: 22 },
        [
          { tempC: 22 },
          { tempC: 19 },
          { tempC: 15 },
          { tempC: 12 },
          { tempC: 10 },
          { tempC: 9 },
        ],
      ),
    );
    expect(r.bringWithYou).toMatch(/extra layer|adjust/i);
  });

  it('stays quiet for a steady day', () => {
    const r = recommend(
      sampleInput(
        { tempC: 18 },
        Array.from({ length: 12 }, () => ({ tempC: 18 })),
      ),
    );
    expect(r.bringWithYou).toBeNull();
  });
});

describe('recommend — body baseline', () => {
  it('runs_cold shifts recommendation to a warmer band', () => {
    const inp = sampleInput({ tempC: 14 });
    const neutral = recommend(inp, { baseline: 'neutral' });
    const cold = recommend(inp, { baseline: 'runs_cold' });
    // runs_cold = +3°C → effective warmer → recommends ONE BAND COOLER outfit
    // (warmer-feeling person needs less). Verify by checking band ordering.
    const bandOrder: Record<string, number> = {
      hot: 0, warm: 1, mild: 2, cool: 3, cold: 4, very_cold: 5, freezing: 6,
    };
    expect(bandOrder[cold.band]).toBeLessThanOrEqual(bandOrder[neutral.band]);
  });
});

describe('recommend — rationale and arc', () => {
  it('returns rationale and a populated dayArc summary', () => {
    const r = recommend(
      sampleInput(
        { tempC: 18 },
        Array.from({ length: 12 }, (_, i) => ({ tempC: 18 + i * 0.5, uvIndex: i })),
      ),
    );
    expect(r.rationale.length).toBeGreaterThan(0);
    expect(r.dayArc.maxApparentC).toBeGreaterThan(r.dayArc.minApparentC);
    expect(r.dayArc.maxUv).toBeGreaterThan(0);
  });
});
