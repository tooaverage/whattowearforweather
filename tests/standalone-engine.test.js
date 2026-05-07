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
  // Pick the largest <script> block. The file has small inline scripts
  // (e.g. the design-style switcher) plus the main engine; we want the
  // engine, which is by far the biggest.
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!blocks.length) throw new Error('no script found in standalone.html');
  const raw = blocks.reduce((a, b) => (b.length > a.length ? b : a), '');
  // Strip the IIFE at the bottom (the part that fetches and renders) so
  // running the script in vm just defines functions / consts and returns.
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
this.saveSnapshot = saveSnapshot;
this.getCloset = getCloset;
this.setCloset = setCloset;
this.addClosetItem = addClosetItem;
this.guessSlotFromName = guessSlotFromName;
this.getSnapshots = getSnapshots;
this.iconForName = iconForName;
this.HUG_ICONS = HUG_ICONS;
this.setLastWeather = (w) => { LAST_WEATHER = w; };
this.setLocation = (l) => { LOCATION = l; };
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

describe('saveSnapshot adds worn items to closet', () => {
  // Reset localStorage between tests to keep them independent.
  function reset() {
    ctx.localStorage.clear();
    ctx.setLastWeather({
      current: { time: '2026-05-06T12:00:00Z', tempC: 14, rh: 70, kph: 8, uv: 2, cloud: 60, isDay: true },
      next12h: [],
      allHours: [],
    });
    ctx.setLocation({ lat: 49.28, lon: -123.12, tz: 'America/Vancouver', name: 'Vancouver, BC' });
  }

  it('persists the snapshot in wtwfw-snapshots', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(['T-shirt']), extra: '', comfort: 0 });
    const snaps = ctx.getSnapshots();
    expect(snaps.length).toBe(1);
    expect(snaps[0].worn).toEqual(['T-shirt']);
    expect(snaps[0].comfort).toBe(0);
  });

  it('adds each worn item to the user closet under the inferred slot', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(['Long sleeve', 'Pants or jeans', 'Sneakers']), extra: '', comfort: 0 });
    const closet = ctx.getCloset();
    expect(closet.base.some(it => it.name === 'Long sleeve')).toBe(true);
    expect(closet.bottom.some(it => it.name === 'Pants or jeans')).toBe(true);
    expect(closet.footwear.some(it => it.name === 'Sneakers')).toBe(true);
  });

  it('adds the free-text extra item to the closet too', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(), extra: 'Plaid Sweater', comfort: 0 });
    const closet = ctx.getCloset();
    // 'Plaid Sweater' should bucket to mid (sweater regex match).
    expect(closet.mid.some(it => it.name === 'Plaid Sweater')).toBe(true);
  });

  it('does not duplicate items already in the closet', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(['T-shirt']), extra: '', comfort: 0 });
    ctx.saveSnapshot({ worn: new Set(['T-shirt']), extra: '', comfort: 0 });
    const closet = ctx.getCloset();
    const tshirts = closet.base.filter(it => it.name.toLowerCase() === 't-shirt');
    expect(tshirts.length).toBe(1);
  });

  it('still adds items when comfort is not just-right', () => {
    // We log everything the user wears regardless of how it felt; the
    // calibration is separate from closet membership.
    reset();
    ctx.saveSnapshot({ worn: new Set(['Hoodie']), extra: '', comfort: -1 });
    const closet = ctx.getCloset();
    // Hoodie matches the outer-layer regex (hoodies are often outerwear).
    expect(closet.outer.some(it => it.name === 'Hoodie')).toBe(true);
  });
});

describe('guessSlotFromName', () => {
  it('routes outer wear correctly', () => {
    expect(ctx.guessSlotFromName('Trench Coat')).toBe('outer');
    expect(ctx.guessSlotFromName('Light jacket')).toBe('outer');
    expect(ctx.guessSlotFromName('Parka')).toBe('outer');
    expect(ctx.guessSlotFromName('Cardigan')).toBe('outer');
  });

  it('routes mid layers correctly', () => {
    expect(ctx.guessSlotFromName('Wool sweater')).toBe('mid');
    expect(ctx.guessSlotFromName('Fleece')).toBe('mid');
    expect(ctx.guessSlotFromName('Pullover')).toBe('mid');
    expect(ctx.guessSlotFromName('Plaid Sweater')).toBe('mid');
  });

  it('routes base layers correctly', () => {
    expect(ctx.guessSlotFromName('T-shirt')).toBe('base');
    expect(ctx.guessSlotFromName('Polo shirt')).toBe('base');
    expect(ctx.guessSlotFromName('Long sleeve')).toBe('base');
    expect(ctx.guessSlotFromName('Tank top')).toBe('base');
    expect(ctx.guessSlotFromName('Blouse')).toBe('base');
  });

  it('routes bottoms correctly', () => {
    expect(ctx.guessSlotFromName('Pants or jeans')).toBe('bottom');
    expect(ctx.guessSlotFromName('Skinny jeans')).toBe('bottom');
    expect(ctx.guessSlotFromName('Skirt')).toBe('bottom');
    expect(ctx.guessSlotFromName('Leggings')).toBe('bottom');
    expect(ctx.guessSlotFromName('Chinos')).toBe('bottom');
  });

  it('routes footwear correctly', () => {
    expect(ctx.guessSlotFromName('Sneakers')).toBe('footwear');
    expect(ctx.guessSlotFromName('Snow boots')).toBe('footwear');
    expect(ctx.guessSlotFromName('Heels')).toBe('footwear');
    expect(ctx.guessSlotFromName('Sandals')).toBe('footwear');
  });

  it('falls back to base for unknown names', () => {
    expect(ctx.guessSlotFromName('Random thing')).toBe('base');
    expect(ctx.guessSlotFromName('')).toBe('base');
  });
});

describe('findMatchingSnapshot', () => {
  function makeRec(temp, conds) {
    return {
      aNow: temp,
      conditions: conds || [],
    };
  }

  function reset() {
    ctx.localStorage.clear();
    ctx.setLastWeather({
      current: { time: '2026-05-06T12:00:00Z', tempC: 14, rh: 70, kph: 8, uv: 2, cloud: 60, isDay: true },
      next12h: [],
      allHours: [],
    });
    ctx.setLocation({ lat: 49.28, lon: -123.12, tz: 'America/Vancouver', name: 'Vancouver' });
  }

  it('returns null when there are no snapshots', () => {
    reset();
    expect(ctx.findMatchingSnapshot(makeRec(15))).toBeNull();
  });

  it('returns null when all snapshots are too far in temperature', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(['Parka']), extra: '', comfort: 0 });
    // Set the last-snapshot's feels manually so it is at -10
    const arr = JSON.parse(ctx.localStorage.getItem('wtwfw-snapshots'));
    arr[0].feels = -10;
    ctx.localStorage.setItem('wtwfw-snapshots', JSON.stringify(arr));
    expect(ctx.findMatchingSnapshot(makeRec(20))).toBeNull();
  });

  it('returns the closest temperature match', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(['T-shirt']), extra: '', comfort: 0 });
    let arr = JSON.parse(ctx.localStorage.getItem('wtwfw-snapshots'));
    arr[0].feels = 18; arr[0].worn = ['Shirt A'];
    ctx.localStorage.setItem('wtwfw-snapshots', JSON.stringify(arr));

    ctx.saveSnapshot({ worn: new Set(['T-shirt']), extra: '', comfort: 0 });
    arr = JSON.parse(ctx.localStorage.getItem('wtwfw-snapshots'));
    arr[0].feels = 22; arr[0].worn = ['Shirt B'];
    ctx.localStorage.setItem('wtwfw-snapshots', JSON.stringify(arr));

    const match = ctx.findMatchingSnapshot(makeRec(21));
    expect(match).toBeTruthy();
    expect(match.worn).toContain('Shirt B');
  });

  it('penalizes condition mismatches', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(['Trench']), extra: '', comfort: 0 });
    let arr = JSON.parse(ctx.localStorage.getItem('wtwfw-snapshots'));
    arr[0].feels = 15; arr[0].conditions = ['rain']; arr[0].worn = ['Rain match'];
    ctx.localStorage.setItem('wtwfw-snapshots', JSON.stringify(arr));

    ctx.saveSnapshot({ worn: new Set(['Trench']), extra: '', comfort: 0 });
    arr = JSON.parse(ctx.localStorage.getItem('wtwfw-snapshots'));
    arr[0].feels = 15; arr[0].conditions = []; arr[0].worn = ['Dry match'];
    ctx.localStorage.setItem('wtwfw-snapshots', JSON.stringify(arr));

    // Same temp; rec has rain conditions. Rain-conditioned snapshot wins.
    const match = ctx.findMatchingSnapshot(makeRec(15, ['rain']));
    expect(match.worn).toContain('Rain match');
  });

  it('skips snapshots with extreme comfort (way too cold/warm)', () => {
    reset();
    ctx.saveSnapshot({ worn: new Set(['T-shirt']), extra: '', comfort: 2 });
    const arr = JSON.parse(ctx.localStorage.getItem('wtwfw-snapshots'));
    arr[0].feels = 15;
    ctx.localStorage.setItem('wtwfw-snapshots', JSON.stringify(arr));
    expect(ctx.findMatchingSnapshot(makeRec(15))).toBeNull();
  });
});

describe('iconForName regression', () => {
  it('routes basic clothing names correctly', () => {
    expect(ctx.iconForName('T-shirt')).toBe('fig-t-shirt');
    expect(ctx.iconForName('Long sleeve')).toBe('fig-long-sleeve');
    expect(ctx.iconForName('Hoodie')).toBe('fig-hoodie');
    expect(ctx.iconForName('Cardigan')).toBe('fig-cardigan');
    expect(ctx.iconForName('Sweater')).toBe('fig-sweater');
    expect(ctx.iconForName('Trench coat')).toBe('fig-trench-coat');
    expect(ctx.iconForName('Parka')).toBe('fig-parka');
    expect(ctx.iconForName('Puffer jacket')).toBe('fig-puffer-jacket');
    expect(ctx.iconForName('Skirt')).toBe('fig-skirt');
    // 'Pants or jeans' contains 'jean' which matches the jeans rule first.
    expect(ctx.iconForName('Pants or jeans')).toBe('fig-jeans');
    expect(ctx.iconForName('Khaki pants')).toBe('fig-pants');
    expect(ctx.iconForName('Shorts')).toBe('fig-shorts');
  });

  it('uses Hugeicons for items the Figma set lacks', () => {
    expect(ctx.iconForName('Sneakers')).toBe('running-shoes');
    expect(ctx.iconForName('Boots')).toBe('armored-boot');
    expect(ctx.iconForName('Heels')).toBe('high-heels-01');
    expect(ctx.iconForName('Sandals')).toBe('sandals');
    expect(ctx.iconForName('Umbrella')).toBe('umbrella');
    expect(ctx.iconForName('Sunglasses')).toBe('sunglasses');
  });

  it('returns null for unknown names', () => {
    expect(ctx.iconForName('Random thing')).toBeNull();
    expect(ctx.iconForName('')).toBeNull();
  });

  it('every icon iconForName returns is present in HUG_ICONS or as an emoji', () => {
    // Sample of known good names. Each should resolve to a key that is
    // either in HUG_ICONS (fig-* or hugeicons names) or is an emoji
    // string (length < 5 chars typically). Catches regressions where a
    // mapping points at an icon key that was renamed/removed.
    const names = ['T-shirt', 'Long sleeve', 'Hoodie', 'Cardigan', 'Sweater',
                   'Trench coat', 'Parka', 'Puffer jacket', 'Skirt', 'Pants',
                   'Shorts', 'Sneakers', 'Boots', 'Heels', 'Sandals',
                   'Umbrella', 'Sunglasses', 'Hat', 'Cap', 'Gloves', 'Socks'];
    for (const name of names) {
      const key = ctx.iconForName(name);
      expect(key, `iconForName(${name}) returned null`).not.toBeNull();
      const isInDict = !!(ctx.HUG_ICONS && ctx.HUG_ICONS[key]);
      const isEmoji = typeof key === 'string' && key.length <= 4;
      expect(isInDict || isEmoji, `iconForName(${name}) -> ${key} not in HUG_ICONS or emoji`).toBe(true);
    }
  });

  it('handles case insensitivity and partial matches', () => {
    expect(ctx.iconForName('PLAID SWEATER')).toBe('fig-sweater');
    expect(ctx.iconForName('blue jeans')).toBe('fig-jeans');
    expect(ctx.iconForName('My favorite hoodie')).toBe('fig-hoodie');
  });
});
