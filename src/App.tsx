import { useEffect, useState } from 'react';
import { recommend, type OutfitRecommendation, type WeatherInput } from './engine';
import { OpenMeteoProvider } from './weather/openMeteo';
import { VANCOUVER } from './weather/types';
import { CurrentBlock } from './ui/CurrentBlock';
import { DayArc } from './ui/DayArc';
import { OutfitBlock } from './ui/OutfitBlock';
import { BringWithYou } from './ui/BringWithYou';
import { Rationale } from './ui/Rationale';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; error: string }
  | { kind: 'ready'; weather: WeatherInput; rec: OutfitRecommendation };

export default function App() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const ctrl = new AbortController();
    const provider = new OpenMeteoProvider();
    provider
      .fetch(VANCOUVER, ctrl.signal)
      .then((weather) => {
        const rec = recommend(weather);
        setState({ kind: 'ready', weather, rec });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState({ kind: 'error', error: message });
      });
    return () => ctrl.abort();
  }, []);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-4 p-4 pb-10">
      {state.kind === 'loading' && <Loading />}
      {state.kind === 'error' && <ErrorBlock message={state.error} />}
      {state.kind === 'ready' && (
        <>
          <CurrentBlock
            current={state.weather.current}
            rec={state.rec}
            locationName={VANCOUVER.name}
          />
          <BringWithYou message={state.rec.bringWithYou} />
          <OutfitBlock rec={state.rec} />
          <DayArc points={state.weather.next12h} />
          <Rationale rationale={state.rec.rationale} source={state.weather.source} />
        </>
      )}
      <footer className="pt-2 text-center text-[11px] text-slate-500">
        Engine: rules-based, metric · Vancouver, BC · v1
      </footer>
    </main>
  );
}

function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-sm text-slate-400">
      Checking the sky…
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-rose-500/10 p-4 ring-1 ring-rose-500/30">
      <p className="text-sm font-semibold text-rose-200">Couldn't load the forecast</p>
      <p className="mt-1 text-xs text-rose-300/80">{message}</p>
    </div>
  );
}
