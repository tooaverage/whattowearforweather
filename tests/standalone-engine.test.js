// Tests the actual engine code shipped in standalone.html. Loads the file,
// extracts the <script>, evaluates it in a vm context with a minimal
// browser-like shim, and asserts on the pure functions. No duplication: if
// an engine function changes shape in standalone.html, these tests notice.

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import vm from 'node:vm';

let ctx;

beforeAll(() => {
  const html = fs.readFileSync('standalone.html', 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no script found in standalone.html');
  // Strip the IIFE at the bottom (the part that fetches and renders) so
  // running the script in vm just defines functions / consts and returns.
  const raw = m[1];
  const cut = raw.lastIndexOf('(async () =>');
  const script = cut >= 0 ? raw.slice(0, cut) : raw;

  ctx = {
    console,
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {}, body: { appendChild: () => {} } },
    window: {},
    fetch: () => Promise.reject(new Error('no network in tests')),
    requestAnimationFrame: (cb) => cb && cb(),
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
      clear() { this._data = {}; },
    },
    navigator: {},
    Intl: globalThis.Intl,
  };
  vm.createContext(ctx);
  vm.runInContext(script + `
this.apparentC = apparentC;
this.feels = feels;
this.solarElevation = solarElevation;
this.cloudAdj = cloudAdj;
this.breezeAdj = breezeAdj;
this.adaptiveShift = adaptiveShift;
this.totalClo = totalClo;
this.pickBand = pickBand;
this.summarizeArc = summarizeArc;
this.recommend = recommend;
this.RECIPES = RECIPES;
this.CFG = CFG;
this.buildTodayCells = buildTodayCells;
this.bandIdx = bandIdx;
this.effective = effective;
this.itemMatchesItem = itemMatchesItem;
this.findMatchingSnapshot = findMatchingSnapshot;
`, ctx);
});

describe('apparentC', () => {
  it('returns roughly air temp when conditions are mild', () => {
    const a = ctx.apparentC(20, 50, 5);
    expect(Math.abs(a - 20)).toBeLessThan(3);
  });

  it('applies NWS Wind Chill below 10C with wind > 4.8 km/h', () => {
    // Reference: at -5C with 30 km/h wind, NWS Wind Chill ≈ -10.6C
    const a = ctx.apparentC(-5, 50, 30);
    expect(a).toBeLessThan(-8);
    expect(a).toBeGreaterThan(-13);
  });

  it('does not apply wind chill above 10C (only BOM AT)', () => {
    const a = ctx.apparentC(15, 50, 30);
    // BOM AT in a stiff wind shaves several deg; just sanity-check we're not
    // crashing into wind-chill territory (NWS WC at 15C+30km/h would be ~5C)
    expect(a).toBeGreaterThan(7);
  });

  it('applies NWS Heat Index above 26.7C with humidity', () => {
    // Reference: at 30C with 70% RH, NWS HI ≈ 35C
    const a = ctx.apparentC(30, 70, 0);
    expect(a).toBeGreaterThan(33);
  });

  it('is monotonic in air temp', () => {
    expect(ctx.apparentC(25, 50, 5)).toBeGreaterThan(ctx.apparentC(15, 50, 5));
  });

  it('is monotonic decreasing in wind for cold temps', () => {
    expect(ctx.apparentC(0, 50, 30)).toBeLessThan(ctx.apparentC(0, 50, 5));
  });
});

describe('breezeAdj', () => {
  it('returns 0 below 10C (wind chill takes over)', () => {
    expect(ctx.breezeAdj(5, 30)).toBe(0);
  });

  it('returns 0 with calm wind', () => {
    expect(ctx.breezeAdj(20, 5)).toBe(0);
  });

  it('subtracts as wind picks up above 10C', () => {
    expect(ctx.breezeAdj(20, 15)).toBeLessThan(0);
    expect(ctx.breezeAdj(20, 30)).toBeLessThan(ctx.breezeAdj(20, 15));
  });

  it('caps at -2.5deg', () => {
    expect(ctx.breezeAdj(20, 100)).toBe(-2.5);
  });
});

describe('solarElevation', () => {
  it('Vancouver summer noon: sun is high (>50deg)', () => {
    const elev = ctx.solarElevation(49.25, '2026-06-21T12:00:00-07:00');
    expect(elev).toBeGreaterThan(50);
  });

  it('Vancouver winter noon: sun is low (<25deg)', () => {
    const elev = ctx.solarElevation(49.25, '2026-12-21T12:00:00-08:00');
    expect(elev).toBeLessThan(25);
    expect(elev).toBeGreaterThan(10);
  });

  it('Local midnight: sun is below horizon', () => {
    const elev = ctx.solarElevation(49.25, '2026-06-21T00:00:00-07:00');
    expect(elev).toBeLessThan(0);
  });
});

describe('cloudAdj', () => {
  it('returns 0 deep at night', () => {
    const adj = ctx.cloudAdj({ time: '2026-06-21T03:00:00-07:00', cloud: 0, isDay: false });
    expect(adj).toBe(0);
  });

  it('warming bonus for clear midday', () => {
    const adj = ctx.cloudAdj({ time: '2026-06-21T12:00:00-07:00', cloud: 5, isDay: true });
    expect(adj).toBeGreaterThan(0.8);
  });

  it('overcast trims a bit even at midday', () => {
    const adj = ctx.cloudAdj({ time: '2026-06-21T12:00:00-07:00', cloud: 90, isDay: true });
    expect(adj).toBeLessThan(0);
  });

  it('dusk subtracts about 2deg', () => {
    const adj = ctx.cloudAdj({ time: '2026-06-21T21:30:00-07:00', cloud: 0, isDay: true });
    expect(adj).toBeLessThanOrEqual(0);
    expect(adj).toBeGreaterThanOrEqual(-2);
  });
});

describe('adaptiveShift', () => {
  it('returns 0 for empty input', () => {
    expect(ctx.adaptiveShift([])).toBe(0);
  });

  it('warmer climate proxy yields negative shift (recommend cooler)', () => {
    const hours = Array.from({ length: 24 * 7 }, (_, i) => ({
      time: new Date(Date.now() + i * 3600 * 1000).toISOString(),
      tempC: 28,
    }));
    expect(ctx.adaptiveShift(hours)).toBeLessThan(0);
  });

  it('cooler climate proxy yields positive shift (recommend warmer)', () => {
    const hours = Array.from({ length: 24 * 7 }, (_, i) => ({
      time: new Date(Date.now() + i * 3600 * 1000).toISOString(),
      tempC: -2,
    }));
    expect(ctx.adaptiveShift(hours)).toBeGreaterThan(0);
  });

  it('clamped to +/-3', () => {
    const hours = Array.from({ length: 24 * 7 }, (_, i) => ({
      time: new Date(Date.now() + i * 3600 * 1000).toISOString(),
      tempC: 50,
    }));
    expect(Math.abs(ctx.adaptiveShift(hours))).toBeLessThanOrEqual(3);
  });
});

describe('pickBand', () => {
  it('thresholds are correctly ordered warmest to coldest', () => {
    expect(ctx.pickBand(35)).toBe('scorching');
    expect(ctx.pickBand(28)).toBe('hot');
    expect(ctx.pickBand(20)).toBe('warm');
    expect(ctx.pickBand(16)).toBe('mild');
    expect(ctx.pickBand(11)).toBe('cool');
    expect(ctx.pickBand(7)).toBe('chilly');
    expect(ctx.pickBand(3)).toBe('cold');
    expect(ctx.pickBand(-3)).toBe('very_cold');
    expect(ctx.pickBand(-10)).toBe('freezing');
  });

  it('returns freezing for absurdly low values', () => {
    expect(ctx.pickBand(-50)).toBe('freezing');
  });
});

describe('totalClo', () => {
  it('scorching is very low (<0.2)', () => {
    expect(ctx.totalClo(ctx.RECIPES.scorching)).toBeLessThan(0.2);
  });

  it('mild is moderate (0.3-0.5)', () => {
    const c = ctx.totalClo(ctx.RECIPES.mild);
    expect(c).toBeGreaterThan(0.25);
    expect(c).toBeLessThan(0.55);
  });

  it('freezing is heavy (>1.8)', () => {
    expect(ctx.totalClo(ctx.RECIPES.freezing)).toBeGreaterThan(1.8);
  });

  it('clo monotonically increases as the band gets colder', () => {
    const order = ['scorching', 'hot', 'warm', 'mild', 'cool', 'chilly', 'cold', 'very_cold', 'freezing'];
    let prev = -Infinity;
    for (const b of order) {
      const c = ctx.totalClo(ctx.RECIPES[b]);
      expect(c).toBeGreaterThanOrEqual(prev);
      prev = c;
    }
  });
});

describe('summarizeArc', () => {
  it('returns zeros for empty input', () => {
    const arc = ctx.summarizeArc([]);
    expect(arc.min).toBe(0);
    expect(arc.max).toBe(0);
    expect(arc.spread).toBe(0);
  });

  it('captures min/max apparent over the input', () => {
    const hours = [
      { time: '2026-05-01T12:00:00Z', tempC: 18, rh: 50, kph: 5, precipMm: 0, precipProb: 0, uv: 4 },
      { time: '2026-05-01T13:00:00Z', tempC: 22, rh: 50, kph: 5, precipMm: 0, precipProb: 0, uv: 5 },
      { time: '2026-05-01T14:00:00Z', tempC: 14, rh: 50, kph: 20, precipMm: 0, precipProb: 50, uv: 2 },
    ];
    const arc = ctx.summarizeArc(hours);
    expect(arc.max).toBeGreaterThan(arc.min);
    expect(arc.spread).toBeGreaterThan(0);
    expect(arc.maxProb).toBe(50);
    expect(arc.maxKph).toBe(20);
  });

  it('sums total precipitation and snow', () => {
    const hours = [
      { time: '2026-05-01T12:00:00Z', tempC: 5, rh: 80, kph: 10, precipMm: 0.5, precipProb: 50, uv: 1, snowCm: 0.2 },
      { time: '2026-05-01T13:00:00Z', tempC: 5, rh: 80, kph: 10, precipMm: 1.5, precipProb: 60, uv: 0, snowCm: 0.3 },
    ];
    const arc = ctx.summarizeArc(hours);
    expect(arc.totalMm).toBeCloseTo(2);
    expect(arc.totalSnow).toBeCloseTo(0.5);
  });
});

describe('itemMatchesItem', () => {
  it('matches when temp is in range and conditions subset', () => {
    const it = { name: 'Sweater', minTemp: 8, maxTemp: 14, conditions: [] };
    expect(ctx.itemMatchesItem(it, 11, [])).toBe(true);
    expect(ctx.itemMatchesItem(it, 11, ['rain'])).toBe(true);
  });

  it('rejects when temp is out of range', () => {
    const it = { name: 'Sweater', minTemp: 8, maxTemp: 14, conditions: [] };
    expect(ctx.itemMatchesItem(it, 5, [])).toBe(false);
    expect(ctx.itemMatchesItem(it, 20, [])).toBe(false);
  });

  it('rejects when item conditions are not all present', () => {
    const it = { name: 'Raincoat', minTemp: null, maxTemp: null, conditions: ['rain'] };
    expect(ctx.itemMatchesItem(it, 15, [])).toBe(false);
    expect(ctx.itemMatchesItem(it, 15, ['rain'])).toBe(true);
    expect(ctx.itemMatchesItem(it, 15, ['rain', 'wind'])).toBe(true);
  });

  it('null range bounds mean unconstrained', () => {
    const it = { name: 'Tee', minTemp: null, maxTemp: null, conditions: [] };
    expect(ctx.itemMatchesItem(it, -10, [])).toBe(true);
    expect(ctx.itemMatchesItem(it, 40, [])).toBe(true);
  });
});

describe('recommend smoke', () => {
  it('returns the expected shape', () => {
    const c = { time: '2026-05-04T12:00:00Z', tempC: 18, rh: 60, kph: 8, uv: 4, cloud: 30, isDay: true };
    const next12h = Array.from({ length: 10 }, (_, i) => ({
      time: new Date(Date.parse(c.time) + i * 3600 * 1000).toISOString(),
      tempC: 18 + Math.sin(i / 3) * 2,
      rh: 60, kph: 8, precipMm: 0, precipProb: 5, uv: 3, cloud: 30, isDay: true, snowCm: 0,
    }));
    const rec = ctx.recommend({ current: c, next12h });
    expect(rec).toHaveProperty('aNow');
    expect(rec).toHaveProperty('eNow');
    expect(rec).toHaveProperty('band');
    expect(rec).toHaveProperty('layers');
    expect(rec).toHaveProperty('rationale');
    expect(rec).toHaveProperty('arc');
    expect(rec).toHaveProperty('conditions');
    expect(rec).toHaveProperty('clo');
    expect(Array.isArray(rec.rationale)).toBe(true);
    expect(rec.rationale.length).toBeGreaterThan(0);
  });

  it('cold input recommends an outer layer', () => {
    const c = { time: '2026-01-15T12:00:00Z', tempC: -2, rh: 70, kph: 10, uv: 1, cloud: 50, isDay: true };
    const next12h = Array.from({ length: 10 }, (_, i) => ({
      time: new Date(Date.parse(c.time) + i * 3600 * 1000).toISOString(),
      tempC: -2, rh: 70, kph: 10, precipMm: 0, precipProb: 0, uv: 1, cloud: 50, isDay: true, snowCm: 0,
    }));
    const rec = ctx.recommend({ current: c, next12h });
    expect(rec.layers.outer).toBeTruthy();
  });

  it('hot input does not require an outer layer', () => {
    const c = { time: '2026-08-01T14:00:00Z', tempC: 28, rh: 50, kph: 5, uv: 7, cloud: 10, isDay: true };
    const next12h = Array.from({ length: 10 }, (_, i) => ({
      time: new Date(Date.parse(c.time) + i * 3600 * 1000).toISOString(),
      tempC: 28, rh: 50, kph: 5, precipMm: 0, precipProb: 0, uv: 7, cloud: 10, isDay: true, snowCm: 0,
    }));
    const rec = ctx.recommend({ current: c, next12h });
    expect(rec.layers.outer).toBeNull();
  });
});

describe('buildTodayCells smoke', () => {
  it('handles a typical multi-day forecast without throwing', () => {
    const allHours = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 16 * 24; i++) {
      const t = new Date(today.getTime() + i * 3600 * 1000);
      allHours.push({
        time: t.toISOString(),
        tempC: 15 + 5 * Math.sin(i / 24 * Math.PI * 2),
        rh: 60,
        kph: 8,
        precipMm: 0,
        precipProb: 5,
        uv: i % 24 >= 6 && i % 24 <= 18 ? Math.max(0, 5 * Math.sin((i % 24 - 6) / 12 * Math.PI)) : 0,
        cloud: 30,
        snowCm: 0,
        code: 1,
        isDay: i % 24 >= 6 && i % 24 <= 19,
      });
    }
    const result = ctx.buildTodayCells({ allHours });
    expect(result).toBeTruthy();
    expect(Array.isArray(result.cells)).toBe(true);
    expect(result.cells.length).toBeGreaterThan(0);
    expect(Number.isFinite(result.hi)).toBe(true);
    expect(Number.isFinite(result.lo)).toBe(true);
  });
});
