import { useState } from 'react';

interface Props {
  rationale: string[];
  source: string;
}

export function Rationale({ rationale, source }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl bg-slate-900/40 p-4 ring-1 ring-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-baseline justify-between text-left text-xs font-semibold uppercase tracking-widest text-slate-300"
        aria-expanded={open}
      >
        <span>Why this</span>
        <span className="text-slate-500">{open ? '–' : '+'}</span>
      </button>
      {open && (
        <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-slate-300">
          {rationale.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-slate-500">Data: {source}</p>
    </section>
  );
}
