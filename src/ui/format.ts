// Display helpers. Engine internals stay metric; this module does any
// presentation-only rounding/formatting.

import type { Band, WeatherPoint } from '../engine/types';

export const BAND_LABEL: Record<Band, string> = {
  hot: 'Hot',
  warm: 'Warm',
  mild: 'Mild',
  cool: 'Cool',
  cold: 'Cold',
  very_cold: 'Very cold',
  freezing: 'Freezing',
};

export const BAND_COLOR: Record<Band, string> = {
  hot: 'from-orange-400 to-rose-500',
  warm: 'from-amber-300 to-orange-400',
  mild: 'from-emerald-300 to-emerald-500',
  cool: 'from-sky-300 to-sky-500',
  cold: 'from-indigo-300 to-indigo-500',
  very_cold: 'from-indigo-400 to-violet-600',
  freezing: 'from-slate-300 to-slate-600',
};

export function formatTemp(c: number): string {
  return `${Math.round(c)}°`;
}

export function formatTimeShort(iso: string): string {
  const d = new Date(iso);
  // Local time, hour-only — Vancouver is the only city we care about in v1.
  return d.toLocaleTimeString([], { hour: 'numeric', timeZone: 'America/Vancouver' });
}

// WMO weather codes → short label and emoji. Only a small subset needed for
// the day-arc strip; uncommon codes fall back to "—".
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  80: { label: 'Showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '🌧️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm', icon: '⛈️' },
  99: { label: 'Thunderstorm', icon: '⛈️' },
};

export function describeWeather(point: Pick<WeatherPoint, 'weatherCode' | 'isDay'>): { label: string; icon: string } {
  const meta = WMO[point.weatherCode];
  if (meta) return meta;
  return { label: '—', icon: point.isDay ? '🌤️' : '🌙' };
}
