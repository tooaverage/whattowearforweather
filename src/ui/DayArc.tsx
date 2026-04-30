import type { WeatherPoint } from '../engine/types';
import { describeWeather, formatTemp, formatTimeShort } from './format';

interface Props {
  points: WeatherPoint[];
}

export function DayArc({ points }: Props) {
  if (points.length === 0) return null;
  const min = Math.min(...points.map((p) => p.tempC));
  const max = Math.max(...points.map((p) => p.tempC));
  const range = Math.max(max - min, 1);

  return (
    <section className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/5">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Next 12 hours
        </h2>
        <span className="text-xs text-slate-400">
          {formatTemp(min)} – {formatTemp(max)}
        </span>
      </header>
      <ol className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {points.map((p, i) => {
          const { icon } = describeWeather(p);
          const heightPct = 25 + ((p.tempC - min) / range) * 60; // 25–85%
          const isRain = (p.precipProbability ?? 0) >= 30;
          return (
            <li
              key={p.time + i}
              className="flex w-12 shrink-0 flex-col items-center gap-1 rounded-xl bg-slate-800/40 px-1 py-2 text-xs"
            >
              <span className="text-slate-300">{formatTimeShort(p.time)}</span>
              <span className="text-base leading-none" aria-hidden>{icon}</span>
              <div className="relative h-12 w-1.5 rounded-full bg-slate-700/70">
                <div
                  className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-sky-400 to-emerald-300"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="font-medium tabular-nums text-slate-100">
                {formatTemp(p.tempC)}
              </span>
              {isRain && (
                <span className="text-[10px] text-sky-300 tabular-nums">
                  {Math.round(p.precipProbability ?? 0)}%
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
