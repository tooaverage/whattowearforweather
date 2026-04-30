// Weather adapter interface. Anything that can fetch a `WeatherInput` for a
// lat/lon counts as a provider. Engine code never imports this file directly;
// it consumes the `WeatherInput` shape exported from `engine/types`.

import type { WeatherInput } from '../engine/types';

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  /** IANA timezone, used so the provider can return local-day-aligned data. */
  timezone: string;
}

export interface WeatherProvider {
  /** Fetch current + next-12h forecast as a normalised WeatherInput. */
  fetch(loc: Location, signal?: AbortSignal): Promise<WeatherInput>;
}

export const VANCOUVER: Location = {
  name: 'Vancouver, BC',
  latitude: 49.2497,
  longitude: -123.1193,
  timezone: 'America/Vancouver',
};
