// Open-Meteo provider. Free, no key, decent data quality.
//   https://open-meteo.com/en/docs

import type { WeatherInput, WeatherPoint } from '../engine/types';
import type { Location, WeatherProvider } from './types';

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'wind_speed_10m',
  'wind_gusts_10m',
  'uv_index',
];

const HOURLY_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'wind_speed_10m',
  'wind_gusts_10m',
  'uv_index',
  'is_day',
];

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: 0 | 1;
    precipitation: number;
    rain?: number;
    showers?: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    uv_index: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    showers: number[];
    snowfall: number[];
    weather_code: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    uv_index: number[];
    is_day: (0 | 1)[];
  };
}

function buildUrl(loc: Location): string {
  const params = new URLSearchParams({
    latitude: String(loc.latitude),
    longitude: String(loc.longitude),
    timezone: loc.timezone,
    current: CURRENT_VARS.join(','),
    hourly: HOURLY_VARS.join(','),
    wind_speed_unit: 'kmh',
    temperature_unit: 'celsius',
    precipitation_unit: 'mm',
    forecast_days: '2', // cover the next 12h even when "now" is late evening
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function pointFromCurrent(c: OpenMeteoResponse['current']): WeatherPoint {
  return {
    time: c.time,
    tempC: c.temperature_2m,
    relativeHumidity: c.relative_humidity_2m,
    windKph: c.wind_speed_10m,
    gustKph: c.wind_gusts_10m,
    precipMm: c.precipitation,
    snowfallCm: c.snowfall, // Open-Meteo: snowfall in cm
    uvIndex: c.uv_index,
    cloudCoverPct: c.cloud_cover,
    isDay: c.is_day === 1,
    weatherCode: c.weather_code,
  };
}

function pointFromHourly(h: OpenMeteoResponse['hourly'], i: number): WeatherPoint {
  return {
    time: h.time[i],
    tempC: h.temperature_2m[i],
    relativeHumidity: h.relative_humidity_2m[i],
    windKph: h.wind_speed_10m[i],
    gustKph: h.wind_gusts_10m[i],
    precipMm: h.precipitation[i],
    precipProbability: h.precipitation_probability[i],
    snowfallCm: h.snowfall[i],
    uvIndex: h.uv_index[i],
    cloudCoverPct: h.cloud_cover[i],
    isDay: h.is_day[i] === 1,
    weatherCode: h.weather_code[i],
  };
}

/**
 * Open-Meteo returns hourly arrays in local time of the requested timezone.
 * "Now" in those terms is the largest hour timestamp ≤ Date.now().
 */
function findStartIndex(times: string[]): number {
  const now = Date.now();
  let last = 0;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    if (t <= now) last = i;
    else break;
  }
  return last;
}

export class OpenMeteoProvider implements WeatherProvider {
  async fetch(loc: Location, signal?: AbortSignal): Promise<WeatherInput> {
    const url = buildUrl(loc);
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`Open-Meteo request failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as OpenMeteoResponse;

    const start = findStartIndex(data.hourly.time);
    const next12h: WeatherPoint[] = [];
    for (let i = start; i < start + 12 && i < data.hourly.time.length; i++) {
      next12h.push(pointFromHourly(data.hourly, i));
    }

    return {
      current: pointFromCurrent(data.current),
      next12h,
      source: 'Open-Meteo',
    };
  }
}
