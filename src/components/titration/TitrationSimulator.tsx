'use client';

import { useState, useCallback, useMemo } from 'react';
import { DB, type Species, getPkas, getTitrantCandidates, getDefaultTitrant } from './AcidBaseDB';
import { calculate, type TitrationResult } from './ChemistryEngine';
import TitrationChart from './TitrationChart';
import TitrationControls from './TitrationControls';
import RelatedTools from '@/components/shared/RelatedTools';
import EducationPanel, { FormulaBlock, DefTerm } from '@/components/shared/EducationPanel';

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
  showAdvanced: boolean;
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
  showAdvanced: false,
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
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <EducationPanel title="Titration Theory" icon="📖" defaultOpen={false}>
            <p className="mb-2">
              <b>Acid-base titration</b> determines the concentration of an unknown acid or base by
              reacting it with a standard solution of known concentration until the equivalence point.
            </p>
            <FormulaBlock label="pH Definition">
              <div>pH = −log₁₀[H⁺]</div>
              <div className="text-[9px] text-[var(--color-text-muted)] mt-1">
                Ranges from 0 (strongly acidic) to 14 (strongly basic) at 25°C. Neutral: pH = 7.
              </div>
            </FormulaBlock>
            <FormulaBlock label="Water Autoionization">
              <div>K<sub>w</sub> = [H⁺][OH⁻] = 10⁻¹⁴ at 25°C</div>
            </FormulaBlock>
            <DefTerm term="Equivalence point">
              Moles of titrant exactly equal moles of analyte. The pH at this point depends on
              the salt formed (neutral for strong/strong, basic for weak acid/strong base).
            </DefTerm>
            <DefTerm term="Buffer region">
              Near the half-equivalence point (pH ≈ pKa), the solution resists pH changes.
              Enable the Henderson-Hasselbalch overlay to see buffer zones.
            </DefTerm>
          </EducationPanel>

          <EducationPanel title="Key Indicators" icon="🧪" defaultOpen={false}>
            <div className="space-y-1.5">
              <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
                <div className="font-semibold text-pink-400 text-[10px]">Phenolphthalein</div>
                <div className="text-[10px]">pH 8.2–10.0. Colorless → pink. Best for strong acid + strong base.</div>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
                <div className="font-semibold text-orange-400 text-[10px]">Methyl orange</div>
                <div className="text-[10px]">pH 3.1–4.4. Red → yellow. Best for strong base titrated by strong acid.</div>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
                <div className="font-semibold text-blue-400 text-[10px]">Bromothymol blue</div>
                <div className="text-[10px]">pH 6.0–7.6. Yellow → blue. Good for neutral endpoint titrations.</div>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
                <div className="font-semibold text-purple-400 text-[10px]">Thymol blue</div>
                <div className="text-[10px]">pH 1.2–2.8 (1st), 8.0–9.6 (2nd). Dual-range indicator.</div>
              </div>
            </div>
          </EducationPanel>

          <EducationPanel title="Learning Exercises" icon="📝" defaultOpen={false}>
            <div className="space-y-2">
              <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
                <div className="font-semibold text-[var(--color-accent-yellow)] text-[10px] mb-1">Exercise 1</div>
                <div>Titrate CH₃COOH with NaOH. Find the half-equivalence point where pH = pKa = 4.76.
                Enable the derivative curve to locate it precisely.</div>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
                <div className="font-semibold text-[var(--color-accent-yellow)] text-[10px] mb-1">Exercise 2</div>
                <div>Compare the curves for H₃PO₄ (triprotic) and HCl (strong monoprotic).
                Why does the polyprotic acid show multiple equivalence points?</div>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
                <div className="font-semibold text-[var(--color-accent-yellow)] text-[10px] mb-1">Exercise 3</div>
                <div>Dilute the acid 10× (C from 0.1 to 0.01 M). How does the sharpness of the
                equivalence point change, and why does this matter for practical titrations?</div>
              </div>
            </div>
          </EducationPanel>
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
