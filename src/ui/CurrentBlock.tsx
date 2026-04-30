import type { OutfitRecommendation, WeatherPoint } from '../engine/types';
import { BAND_COLOR, BAND_LABEL, describeWeather, formatTemp } from './format';

interface Props {
  current: WeatherPoint;
  rec: OutfitRecommendation;
  locationName: string;
}

export function CurrentBlock({ current, rec, locationName }: Props) {
  const { label, icon } = describeWeather(current);
  return (
    <section
      className={`rounded-3xl bg-gradient-to-br ${BAND_COLOR[rec.band]} p-6 text-slate-950 shadow-lg shadow-black/20`}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
          {locationName}
        </p>
        <p className="text-xs font-medium opacity-80">{BAND_LABEL[rec.band]}</p>
      </div>

      <div className="mt-2 flex items-end gap-4">
        <div className="text-7xl font-semibold tabular-nums leading-none">
          {formatTemp(current.tempC)}
        </div>
        <div className="pb-2">
          <div className="text-2xl">{icon}</div>
          <div className="text-sm font-medium">{label}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Fact label="Feels like" value={formatTemp(rec.apparentNowC)} />
        <Fact label="Humidity" value={`${Math.round(current.relativeHumidity)}%`} />
        <Fact label="Wind" value={`${Math.round(current.windKph)} km/h`} />
        <Fact label="UV" value={current.uvIndex.toFixed(1)} />
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-xl bg-black/10 px-3 py-2">
      <span className="opacity-75">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
