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

// score(rec, monthIndex) -> 0..100 comfort for visiting that month.
function score(rec, m, cfg = CFG) {
  const t = tempScore(rec.hi[m], rec.lo[m], cfg);
  const r = rainScore(rec.pr[m], cfg);
  return Math.round(t * cfg.wTemp + r * cfg.wRain);
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
  module.exports = { CFG, score, band, scoreColor, monthRanking, tempScore, rainScore };
}
