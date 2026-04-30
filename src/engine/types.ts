// Engine input/output types.
//
// All temperatures are degrees Celsius, wind speeds km/h, precipitation mm.
// The engine is intentionally unit-locked to metric; the weather adapter is
// responsible for converting source data into these units.

export type WeatherCode = number; // WMO code as returned by Open-Meteo

export interface WeatherPoint {
  /** ISO 8601 timestamp for the start of this hour (or "now" for current). */
  time: string;
  /** Air temperature, degrees C. */
  tempC: number;
  /** Relative humidity, percent (0–100). */
  relativeHumidity: number;
  /** Wind speed at 10 m, km/h. */
  windKph: number;
  /** Wind gust at 10 m, km/h. */
  gustKph: number;
  /** Precipitation total for the hour (rain + showers + snow water-equivalent), mm. */
  precipMm: number;
  /** Probability of precipitation for the hour, percent (0–100). May be undefined for "current". */
  precipProbability?: number;
  /** Snowfall for the hour, cm. */
  snowfallCm: number;
  /** UV index. */
  uvIndex: number;
  /** Cloud cover, percent (0–100). */
  cloudCoverPct: number;
  /** Daylight flag from the source. */
  isDay: boolean;
  /** WMO weather code from the source. */
  weatherCode: WeatherCode;
}

export interface WeatherInput {
  /** Right-now conditions. */
  current: WeatherPoint;
  /** Next ~12 hours of hourly forecast, in chronological order. */
  next12h: WeatherPoint[];
  /** Source attribution string for display (e.g. "Open-Meteo"). */
  source: string;
}

export type Activity = 'walking_commute' | 'sedentary_outdoor';

export type ThermalBaseline = 'neutral' | 'runs_cold' | 'runs_warm';

/** Categorical thermal band the engine uses to pick a layering set. */
export type Band = 'hot' | 'warm' | 'mild' | 'cool' | 'cold' | 'very_cold' | 'freezing';

export interface OutfitLayers {
  base: string;
  mid: string | null;
  outer: string | null;
  bottom: string;
  footwear: string;
  accessories: string[];
}

export interface DayArcSummary {
  /** Minimum apparent temperature in the 12h window, degrees C. */
  minApparentC: number;
  /** Maximum apparent temperature in the 12h window, degrees C. */
  maxApparentC: number;
  /** maxApparentC − minApparentC. */
  spreadC: number;
  /** True when the spread crosses at least one layering band boundary. */
  crossesBand: boolean;
  /** Total expected precipitation in the window, mm. */
  totalPrecipMm: number;
  /** Maximum hourly precipitation probability in the window, percent. */
  maxPrecipProbability: number;
  /** Maximum UV index in the window. */
  maxUv: number;
  /** Maximum sustained wind in the window, km/h. */
  maxWindKph: number;
}

export interface OutfitRecommendation {
  /** Apparent temperature right now, degrees C. */
  apparentNowC: number;
  /** Engine-effective temperature (apparent + body/activity offsets), degrees C. */
  effectiveNowC: number;
  /** Categorical band selected for the recommendation. */
  band: Band;
  /** Recommended garments by layer. */
  layers: OutfitLayers;
  /** Short callout for items to bring; null when nothing to mention. */
  bringWithYou: string | null;
  /** Bullet-point explanations of why each major decision was made. */
  rationale: string[];
  /** Numeric summary of the day ahead. */
  dayArc: DayArcSummary;
}
