// Travel-weather engine. Pure functions only: no DOM, no globals, no network.
// Shared by the browser app (index.html inlines an identical copy) and the
// Node test below. All tunable numbers live in CFG.

const CFG = {
  // Daytime-high comfort. Full marks inside the ideal band, linear falloff outside.
  idealHiLow: 21,
  idealHiHigh: 27,
  coldHiPerDeg: 4.2, // score lost per deg C below idealHiLow
  hotHiPerDeg: 4.0, // score lost per deg C above idealHiHigh
  // Cold-night penalty kicks in below this nightly low.
  coldNightStart: 6,
  coldNightPerDeg: 2.0,
  // Extra heat penalty for sticky, very hot days.
  swelterStart: 33,
  swelterPerDeg: 2.5,
  // Rainfall comfort, by monthly precipitation in mm.
  rainDry: 35, // at or below: perfect
  rainPerMm: 0.46, // score lost per mm above rainDry
  // Blend.
  wTemp: 0.6,
  wRain: 0.4,
  // Tropical-storm season (typhoon/hurricane/cyclone) is a curated per-country
  // field, not visible in average rainfall, so it gets a flat score penalty.
  stormPenalty: 17,
  // Hazard tag thresholds.
  monsoonMm: 230, // heavy monsoon rain
  wetMm: 130, // notably wet
  heatHi: 35, // extreme-heat days
  coldHiMax: 5, // daytime stays cold
  coldLoMax: -8, // hard overnight cold
  // Score -> band. Each entry is [minScore, key, label].
  bands: [
    [78, 'ideal', 'Ideal'],
    [62, 'great', 'Great'],
    [46, 'good', 'Good'],
    [30, 'fair', 'Fair'],
    [0, 'avoid', 'Avoid'],
  ],
};

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function tempScore(hi, lo, cfg) {
  let s = 100;
  if (hi < cfg.idealHiLow) s -= (cfg.idealHiLow - hi) * cfg.coldHiPerDeg;
  else if (hi > cfg.idealHiHigh) s -= (hi - cfg.idealHiHigh) * cfg.hotHiPerDeg;
  if (lo < cfg.coldNightStart) s -= (cfg.coldNightStart - lo) * cfg.coldNightPerDeg;
  if (hi > cfg.swelterStart) s -= (hi - cfg.swelterStart) * cfg.swelterPerDeg;
  return clamp(s, 0, 100);
}

function rainScore(pr, cfg) {
  let s = 100;
  if (pr > cfg.rainDry) s -= (pr - cfg.rainDry) * cfg.rainPerMm;
  return clamp(s, 0, 100);
}

function hasStorm(rec, m) {
  return !!(rec.storm && rec.storm.mo.indexOf(m) !== -1);
}

// score(rec, monthIndex) -> 0..100 comfort for visiting that month.
function score(rec, m, cfg = CFG) {
  const t = tempScore(rec.hi[m], rec.lo[m], cfg);
  const r = rainScore(rec.pr[m], cfg);
  let s = t * cfg.wTemp + r * cfg.wRain;
  if (hasStorm(rec, m)) s -= cfg.stormPenalty;
  return Math.round(clamp(s, 0, 100));
}

// Weather hazards for a month, worst-first. Curated storm season plus flags
// derived from the climate data. Each tag has a key (for color) and a label.
function monthTags(rec, m, cfg = CFG) {
  const tags = [];
  if (hasStorm(rec, m)) tags.push({ key: 'storm', label: rec.storm.type + ' risk' });
  const pr = rec.pr[m];
  if (pr >= cfg.monsoonMm) tags.push({ key: 'monsoon', label: 'Heavy monsoon rain' });
  else if (pr >= cfg.wetMm) tags.push({ key: 'wet', label: 'Wet season' });
  if (rec.hi[m] >= cfg.heatHi) tags.push({ key: 'heat', label: 'Extreme heat' });
  if (rec.hi[m] <= cfg.coldHiMax || rec.lo[m] <= cfg.coldLoMax) tags.push({ key: 'cold', label: 'Hard cold' });
  return tags;
}

// Travel season by weather quality: the four best-scoring months are High,
// the next four Shoulder, the rest Low. A proxy for crowds and prices, which
// for most destinations track the good-weather months.
function seasonOf(rec, m, cfg = CFG) {
  const sorted = monthRanking(rec, cfg).sorted;
  const pos = sorted.findIndex(x => x.m === m);
  if (pos < 4) return { key: 'high', label: 'High season' };
  if (pos < 8) return { key: 'shoulder', label: 'Shoulder season' };
  return { key: 'low', label: 'Low season' };
}

// Group month indices into contiguous ranges, wrapping across December, e.g.
// [6,7,8,11] -> "Jul to Sep, Dec". Used for storm and season summaries.
const RT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function rangeText(months) {
  const has = new Array(12).fill(false);
  months.forEach(m => has[m] = true);
  if (has.every(Boolean)) return 'all year';
  if (!months.length) return '';
  let start = 0;
  while (has[start]) start++;
  const parts = [];
  let run = [];
  for (let c = 0; c < 12; c++) {
    const m = (start + c) % 12;
    if (has[m]) run.push(m);
    else if (run.length) { parts.push(run); run = []; }
  }
  if (run.length) parts.push(run);
  return parts.map(r => r.length === 1 ? RT_MONTHS[r[0]] : RT_MONTHS[r[0]] + ' to ' + RT_MONTHS[r[r.length - 1]]).join(', ');
}

function band(s, cfg = CFG) {
  for (const [min, key, label] of cfg.bands) if (s >= min) return { key, label };
  return cfg.bands[cfg.bands.length - 1];
}

// Continuous red -> amber -> green fill for a score, tuned for a dark theme.
function scoreColor(s) {
  const hue = 4 + (clamp(s, 0, 100) / 100) * 121; // 4=red .. 125=green
  return `hsl(${hue.toFixed(0)} 58% 44%)`;
}

// Months sorted best-first, plus the single peak month index.
function monthRanking(rec, cfg = CFG) {
  const scored = rec.hi.map((_, m) => ({ m, s: score(rec, m, cfg) }));
  const sorted = scored.slice().sort((a, b) => b.s - a.s);
  return { sorted, best: sorted[0].m, worst: sorted[sorted.length - 1].m };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CFG, score, band, scoreColor, monthRanking, tempScore, rainScore, monthTags, seasonOf, hasStorm, rangeText };
}
