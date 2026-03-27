'use client';

import { useState, useCallback, useMemo } from 'react';
import { DB, type Species, getPkas, getTitrantCandidates, getDefaultTitrant } from './AcidBaseDB';
import { calculate, type TitrationResult } from './ChemistryEngine';
import TitrationChart from './TitrationChart';
import TitrationControls from './TitrationControls';
import RelatedTools from '@/components/shared/RelatedTools';

export interface TitrationState {
  subId: string;
  titrantId: string;
  Ca: number;
  Va: number;
  Cb: number;
  showDeriv: boolean;
  showEqLines: boolean;
  showPkaLines: boolean;
  showMarkers: boolean;
  showHH: boolean;
}

const INITIAL_STATE: TitrationState = {
  subId: 'ch3cooh',
  titrantId: 'naoh',
  Ca: 0.1,
  Va: 25,
  Cb: 0.1,
  showDeriv: false,
  showEqLines: true,
  showPkaLines: true,
  showMarkers: true,
  showHH: false,
};

export default function TitrationSimulator() {
  const [state, setState] = useState<TitrationState>(INITIAL_STATE);

  const sub = useMemo(() => DB.find((s) => s.id === state.subId)!, [state.subId]);
  const titrant = useMemo(() => DB.find((s) => s.id === state.titrantId)!, [state.titrantId]);

  const result: TitrationResult = useMemo(
    () => calculate(sub, titrant, state.Ca, state.Va, state.Cb),
    [sub, titrant, state.Ca, state.Va, state.Cb]
  );

  const update = useCallback((patch: Partial<TitrationState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (patch.subId && patch.subId !== prev.subId) {
        const newSub = DB.find((s) => s.id === patch.subId)!;
        next.titrantId = getDefaultTitrant(newSub);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-full">
      <div className="w-[320px] min-w-[320px] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
        <TitrationControls
          state={state}
          sub={sub}
          titrant={titrant}
          result={result}
          onUpdate={update}
        />
        <div className="px-3 pb-3">
          <RelatedTools toolId="titration" />
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col min-w-0">
        <div className="text-sm text-[var(--color-text-secondary)] mb-3">
          Titration of{' '}
          <span className="font-bold" style={{ color: sub.color }}>
            {sub.formula}
          </span>{' '}
          ({formatC(state.Ca)} mol/L, {state.Va} mL) by{' '}
          <span className="font-bold" style={{ color: titrant.color }}>
            {titrant.formula}
          </span>{' '}
          ({formatC(state.Cb)} mol/L)
        </div>
        <div className="flex-1 min-h-0">
          <TitrationChart
            result={result}
            sub={sub}
            titrant={titrant}
            state={state}
          />
        </div>
        <div className="flex justify-center gap-5 mt-3 flex-wrap">
          <LegendItem color="linear-gradient(90deg, #818cf8, #22d3ee, #34d399)" label="pH" />
          {state.showDeriv && <LegendItem color="#a78bfa" label="dpH/dV" dashed />}
          {state.showEqLines && <LegendItem color="#f472b6" label="Equivalence" />}
          {state.showPkaLines && <LegendItem color="#34d399" label="½ Equivalence" />}
          {state.showMarkers && <LegendDot color="#fbbf24" label="Markers" />}
        </div>
      </div>
    </div>
  );
}

function formatC(c: number): string {
  if (c >= 0.01) return c.toPrecision(3);
  return c.toExponential(2);
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
      <div
        className="w-4 h-0.5 rounded"
        style={{
          background: color,
          borderTop: dashed ? '1px dashed' : undefined,
        }}
      />
      {label}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
