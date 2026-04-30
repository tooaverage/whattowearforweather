// Pure recommendation engine. Given a WeatherInput and a Config, produce an
// OutfitRecommendation. No I/O, no React.

import { apparentTemperatureC } from './apparent';
import { DEFAULT_CONFIG, type Config } from './config';
import type {
  Activity,
  Band,
  DayArcSummary,
  OutfitLayers,
  OutfitRecommendation,
  ThermalBaseline,
  WeatherInput,
  WeatherPoint,
} from './types';

export interface RecommendOptions {
  config?: Config;
  baseline?: ThermalBaseline;
  activity?: Activity;
}

/**
 * Layering recipes per band. Tuned for "walking commute, neutral baseline";
 * personal calibration is handled upstream via offsets, not by editing these.
 */
const LAYER_RECIPES: Record<Band, OutfitLayers> = {
  hot: {
    base: 'breathable t-shirt',
    mid: null,
    outer: null,
    bottom: 'shorts or light skirt',
    footwear: 'sneakers or sandals',
    accessories: [],
  },
  warm: {
    base: 't-shirt',
    mid: null,
    outer: null,
    bottom: 'shorts or light pants',
    footwear: 'sneakers',
    accessories: [],
  },
  mild: {
    base: 'long-sleeve tee or thin henley',
    mid: null,
    outer: null,
    bottom: 'pants',
    footwear: 'sneakers',
    accessories: [],
  },
  cool: {
    base: 'long-sleeve tee',
    mid: 'light sweater or fleece',
    outer: null,
    bottom: 'pants',
    footwear: 'closed shoes',
    accessories: [],
  },
  cold: {
    base: 'thermal long-sleeve',
    mid: 'sweater or fleece',
    outer: 'insulated jacket',
    bottom: 'pants',
    footwear: 'closed shoes',
    accessories: [],
  },
  very_cold: {
    base: 'thermal base layer',
    mid: 'mid-weight fleece or wool',
    outer: 'insulated winter jacket',
    bottom: 'lined or thermal pants',
    footwear: 'insulated boots',
    accessories: ['warm hat', 'gloves'],
  },
  freezing: {
    base: 'heavy thermal base',
    mid: 'down or heavy fleece',
    outer: 'parka',
    bottom: 'thermal pants under outer pants',
    footwear: 'insulated waterproof boots',
    accessories: ['warm hat', 'insulated gloves', 'scarf or neck gaiter'],
  },
};

function pickBand(effectiveC: number, cfg: Config): Band {
  for (const t of cfg.bands) {
    if (effectiveC >= t.minEffectiveC) return t.band;
  }
  // Defensive: bands list should always end with -Infinity.
  return 'freezing';
}

function bandIndex(band: Band, cfg: Config): number {
  return cfg.bands.findIndex((t) => t.band === band);
}

function summarizeArc(
  next12h: WeatherPoint[],
  cfg: Config,
): DayArcSummary {
  if (next12h.length === 0) {
    return {
      minApparentC: 0,
      maxApparentC: 0,
      spreadC: 0,
      crossesBand: false,
      totalPrecipMm: 0,
      maxPrecipProbability: 0,
      maxUv: 0,
      maxWindKph: 0,
    };
  }
  const apparents = next12h.map((p) =>
    apparentTemperatureC(p.tempC, p.relativeHumidity, p.windKph, cfg),
  );
  const minApparent = Math.min(...apparents);
  const maxApparent = Math.max(...apparents);
  const minBand = pickBand(minApparent, cfg);
  const maxBand = pickBand(maxApparent, cfg);
  return {
    minApparentC: minApparent,
    maxApparentC: maxApparent,
    spreadC: maxApparent - minApparent,
    crossesBand: minBand !== maxBand,
    totalPrecipMm: next12h.reduce((s, p) => s + p.precipMm, 0),
    maxPrecipProbability: next12h.reduce(
      (m, p) => Math.max(m, p.precipProbability ?? 0),
      0,
    ),
    maxUv: next12h.reduce((m, p) => Math.max(m, p.uvIndex), 0),
    maxWindKph: next12h.reduce((m, p) => Math.max(m, p.windKph), 0),
  };
}

function applyOuterOverrides(
  layers: OutfitLayers,
  arc: DayArcSummary,
  cfg: Config,
  rationale: string[],
): OutfitLayers {
  const accessories = [...layers.accessories];
  let outer = layers.outer;
  let footwear = layers.footwear;

  // Wind shell — relevant whenever outer is otherwise empty.
  if (arc.maxWindKph >= cfg.windLayerKph && !outer) {
    outer = 'wind-resistant shell';
    rationale.push(
      `Sustained wind reaches ${Math.round(arc.maxWindKph)} km/h (≥ ${cfg.windLayerKph}); a wind shell will keep convective cooling in check.`,
    );
  }

  // Rain handling.
  const rainLikely =
    arc.maxPrecipProbability >= cfg.rainShellProbabilityPct ||
    arc.totalPrecipMm >= cfg.rainShellTotalMm;
  if (rainLikely) {
    outer = outer ? `${outer} (waterproof)` : 'waterproof rain shell';
    if (arc.totalPrecipMm >= 4) {
      footwear = `waterproof ${footwear}`;
    }
    rationale.push(
      `Rain likely (max ${Math.round(arc.maxPrecipProbability)}% chance, ${arc.totalPrecipMm.toFixed(1)} mm expected over the next 12h) — wear a waterproof shell.`,
    );
  } else if (arc.maxPrecipProbability >= cfg.umbrellaProbabilityPct) {
    accessories.push('compact umbrella');
    rationale.push(
      `Light chance of rain (${Math.round(arc.maxPrecipProbability)}%) — toss an umbrella in your bag.`,
    );
  }

  // Sun handling — only if there's meaningful daylight in the window.
  if (arc.maxUv >= cfg.uvProtectionIndex) {
    if (!accessories.includes('sunglasses')) accessories.push('sunglasses');
    if (arc.maxUv >= cfg.uvProtectionIndex + 1) {
      if (!accessories.some((a) => a.includes('hat'))) {
        accessories.push('brimmed hat');
      }
    }
    rationale.push(
      `UV peaks at ${arc.maxUv.toFixed(1)} (≥ ${cfg.uvProtectionIndex}, WHO threshold for sun protection).`,
    );
    if (arc.maxUv >= cfg.uvSunscreenIndex) {
      accessories.push('sunscreen');
      rationale.push(`UV reaches "high" (≥ ${cfg.uvSunscreenIndex}) — apply SPF.`);
    }
  }

  return { ...layers, outer, footwear, accessories };
}

function bringWithYouCallout(
  effectiveNowC: number,
  arc: DayArcSummary,
  cfg: Config,
): string | null {
  const nowBand = pickBand(effectiveNowC, cfg);
  const minBand = pickBand(arc.minApparentC, cfg);
  const maxBand = pickBand(arc.maxApparentC, cfg);

  const willGetColder = bandIndex(minBand, cfg) > bandIndex(nowBand, cfg);
  const willGetWarmer = bandIndex(maxBand, cfg) < bandIndex(nowBand, cfg);
  const wideSpread = arc.spreadC >= cfg.bringLayerSpreadC;

  const fmt = (c: number) => `${Math.round(c)}°C`;
  if (arc.crossesBand && willGetColder) {
    return `Apparent temp drops from ${fmt(arc.maxApparentC)} to ${fmt(arc.minApparentC)} during the window — bring an extra layer to put on.`;
  }
  if (arc.crossesBand && willGetWarmer) {
    return `Starts at ${fmt(arc.minApparentC)} but reaches ${fmt(arc.maxApparentC)} later — wear something you can shed.`;
  }
  if (wideSpread) {
    return `Apparent temp swings ${arc.spreadC.toFixed(0)}°C across the window (${fmt(arc.minApparentC)}–${fmt(arc.maxApparentC)}) — bring a layer you can adjust.`;
  }
  return null;
}

export function recommend(
  input: WeatherInput,
  options: RecommendOptions = {},
): OutfitRecommendation {
  const cfg = options.config ?? DEFAULT_CONFIG;
  const baseline: ThermalBaseline = options.baseline ?? 'neutral';
  const activity: Activity = options.activity ?? 'walking_commute';

  const apparentNowC = apparentTemperatureC(
    input.current.tempC,
    input.current.relativeHumidity,
    input.current.windKph,
    cfg,
  );
  const effectiveNowC =
    apparentNowC + cfg.baselineOffsets[baseline] + cfg.activityOffsets[activity];

  const band = pickBand(effectiveNowC, cfg);
  const arc = summarizeArc(input.next12h, cfg);

  const rationale: string[] = [];
  rationale.push(
    `Apparent temp now: ${apparentNowC.toFixed(1)}°C (air ${input.current.tempC.toFixed(1)}°C, ${Math.round(input.current.relativeHumidity)}% RH, wind ${Math.round(input.current.windKph)} km/h).`,
  );
  if (effectiveNowC !== apparentNowC) {
    rationale.push(
      `Engine-effective: ${effectiveNowC.toFixed(1)}°C after baseline (${cfg.baselineOffsets[baseline] >= 0 ? '+' : ''}${cfg.baselineOffsets[baseline]}°C) and activity (${cfg.activityOffsets[activity] >= 0 ? '+' : ''}${cfg.activityOffsets[activity]}°C) offsets.`,
    );
  }
  rationale.push(`Selected band: ${band.replace('_', ' ')}.`);

  const baseLayers = LAYER_RECIPES[band];
  const finalLayers = applyOuterOverrides(baseLayers, arc, cfg, rationale);
  const bringWithYou = bringWithYouCallout(effectiveNowC, arc, cfg);

  return {
    apparentNowC,
    effectiveNowC,
    band,
    layers: finalLayers,
    bringWithYou,
    rationale,
    dayArc: arc,
  };
}
