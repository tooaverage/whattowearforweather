import type { OutfitRecommendation } from '../engine/types';

interface Props {
  rec: OutfitRecommendation;
}

const LAYER_KEYS: { key: keyof OutfitRecommendation['layers']; label: string }[] = [
  { key: 'base', label: 'Base' },
  { key: 'mid', label: 'Mid' },
  { key: 'outer', label: 'Outer' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'footwear', label: 'Footwear' },
];

export function OutfitBlock({ rec }: Props) {
  return (
    <section className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-300">
        Wear
      </h2>
      <ul className="divide-y divide-white/5">
        {LAYER_KEYS.map(({ key, label }) => {
          const value = rec.layers[key as 'base' | 'mid' | 'outer' | 'bottom' | 'footwear'];
          if (!value) return null;
          return (
            <li key={key} className="flex items-baseline justify-between py-2.5 text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="text-right font-medium text-slate-100">{value}</span>
            </li>
          );
        })}
      </ul>
      {rec.layers.accessories.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Plus
          </div>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {rec.layers.accessories.map((a) => (
              <li
                key={a}
                className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
