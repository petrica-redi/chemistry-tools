'use client';

import { DB, type Species, getPkas, getTitrantCandidates } from './AcidBaseDB';
import type { TitrationResult } from './ChemistryEngine';
import type { TitrationState } from './TitrationSimulator';
import Panel from '@/components/shared/Panel';
import SliderControl from '@/components/shared/SliderControl';

interface Props {
  state: TitrationState;
  sub: Species;
  titrant: Species;
  result: TitrationResult;
  onUpdate: (patch: Partial<TitrationState>) => void;
}

function formatC(c: number): string {
  if (c >= 0.01) return c.toPrecision(3);
  return c.toExponential(2);
}

function groupLabel(s: Species): string {
  if (s.type === 'acid' && s.strong) return 'Strong Acids';
  if (s.type === 'acid' && !s.strong && !s.poly) return 'Weak Acids';
  if (s.type === 'acid' && s.poly) return 'Polyprotic Acids';
  if (s.type === 'base' && s.strong) return 'Strong Bases';
  if (s.type === 'base' && !s.strong && !s.poly) return 'Weak Bases';
  if (s.type === 'base' && s.poly) return 'Polybases';
  return '';
}

export default function TitrationControls({ state, sub, titrant, result, onUpdate }: Props) {
  const subPka = getPkas(sub);
  const titrantPka = getPkas(titrant);
  const candidates = getTitrantCandidates(sub);

  const subGroups: Record<string, Species[]> = {};
  for (const s of DB) {
    const g = groupLabel(s);
    if (!subGroups[g]) subGroups[g] = [];
    subGroups[g].push(s);
  }

  const titrantGroups: Record<string, Species[]> = {};
  for (const s of candidates) {
    const g = groupLabel(s);
    if (!titrantGroups[g]) titrantGroups[g] = [];
    titrantGroups[g].push(s);
  }

  const typeLabel = sub.strong
    ? sub.type === 'acid' ? 'Strong acid' : 'Strong base'
    : sub.poly
      ? sub.type === 'acid' ? 'Polyacid' : 'Polybase'
      : sub.type === 'acid' ? 'Weak acid' : 'Weak base';

  return (
    <div className="flex flex-col gap-3">
      {/* Substance selector */}
      <Panel title="Substance to titrate">
        <select
          value={state.subId}
          onChange={(e) => onUpdate({ subId: e.target.value })}
          className="mb-2"
        >
          {Object.entries(subGroups).map(([group, species]) => (
            <optgroup key={group} label={group}>
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.formula} — {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-bold" style={{ color: sub.color }}>
              {sub.formula}
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                sub.type === 'acid'
                  ? 'bg-pink-500/10 text-pink-400'
                  : 'bg-cyan-500/10 text-cyan-400'
              }`}
            >
              {typeLabel}
            </span>
          </div>
          {subPka.length > 0 && (
            <div className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
              {subPka.map((p) => (
                <span key={p.label} className="mr-3">
                  {p.label}={' '}
                  <span className="font-mono font-semibold text-[var(--color-accent-cyan)]">
                    {p.value.toFixed(2)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Titrant selector */}
      <Panel title="Titrant">
        <select
          value={state.titrantId}
          onChange={(e) => onUpdate({ titrantId: e.target.value })}
          className="mb-2"
        >
          {Object.entries(titrantGroups).map(([group, species]) => (
            <optgroup key={group} label={group}>
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.formula} — {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 border border-[var(--color-border)]">
          <span className="font-mono text-base font-bold" style={{ color: titrant.color }}>
            {titrant.formula}
          </span>
          {titrantPka.length > 0 && (
            <div className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
              {titrantPka.map((p) => (
                <span key={p.label} className="mr-3">
                  {p.label}={' '}
                  <span className="font-mono font-semibold text-[var(--color-accent-cyan)]">
                    {p.value.toFixed(2)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Concentrations */}
      <Panel title="Concentrations & Volume">
        <ConcentrationSlider
          label={`C (${sub.formula})`}
          value={state.Ca}
          color={sub.color}
          onChange={(v) => onUpdate({ Ca: v })}
        />
        <SliderControl
          label={`V (${sub.formula})`}
          value={state.Va}
          min={5}
          max={100}
          step={1}
          unit=" mL"
          color={sub.color}
          onChange={(v) => onUpdate({ Va: v })}
        />
        <ConcentrationSlider
          label={`C (${titrant.formula})`}
          value={state.Cb}
          color={titrant.color}
          onChange={(v) => onUpdate({ Cb: v })}
        />
      </Panel>

      {/* Display options */}
      <Panel title="Display">
        {[
          { key: 'showDeriv' as const, label: 'Derivative curve dpH/dV', color: 'var(--color-accent-purple)' },
          { key: 'showEqLines' as const, label: 'Equivalence lines', color: 'var(--color-accent-pink)' },
          { key: 'showPkaLines' as const, label: 'Half-equivalence lines', color: 'var(--color-accent-green)' },
          { key: 'showMarkers' as const, label: 'Curve markers', color: 'var(--color-accent-yellow)' },
          { key: 'showHH' as const, label: 'Buffer zones (HH)', color: 'var(--color-accent-cyan)' },
        ].map(({ key, label, color }) => (
          <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
            <div
              className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center text-[8px] font-bold transition-all"
              style={{
                borderColor: state[key] ? color : 'var(--color-text-muted)',
                background: state[key] ? color : 'transparent',
                color: state[key] ? '#fff' : 'transparent',
              }}
              onClick={() => onUpdate({ [key]: !state[key] })}
            >
              ✓
            </div>
            <span className="text-[12px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
              {label}
            </span>
          </label>
        ))}
      </Panel>

      {/* Equivalence points info */}
      {result.eq.length > 0 && (
        <Panel title="Equivalence Points">
          {result.eq.map((e) => (
            <div
              key={e.label}
              className="flex justify-between items-center py-1.5 px-2 mb-1 rounded text-[12px] font-mono bg-pink-500/5 border border-pink-500/10"
            >
              <span className="text-pink-400 font-semibold">{e.label}</span>
              <span className="text-[var(--color-text-secondary)]">
                V=<span className="text-[var(--color-text-primary)] font-semibold">{e.v}</span> mL | pH=
                <span className="text-[var(--color-accent-cyan)] font-semibold">{e.pH}</span>
              </span>
            </div>
          ))}
        </Panel>
      )}

      {result.he.length > 0 && (
        <Panel title="Half-Equivalence Points">
          {result.he.map((h, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-1.5 px-2 mb-1 rounded text-[12px] font-mono bg-green-500/5 border border-green-500/10"
            >
              <span className="text-green-400 font-semibold">½{h.pk.label}</span>
              <span className="text-[var(--color-text-secondary)]">
                V=<span className="text-[var(--color-text-primary)] font-semibold">{h.v}</span> mL | pH=
                <span className="text-[var(--color-accent-cyan)] font-semibold">{h.pH}</span>
              </span>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}

function ConcentrationSlider({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  const exp = Math.floor(Math.log10(Math.max(value, 1e-8)));
  const mant = value / Math.pow(10, exp);

  return (
    <div className="mb-3 bg-[var(--color-bg-tertiary)] rounded-lg p-3 border border-[var(--color-border)]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-mono text-[12px] font-bold" style={{ color }}>
          {formatC(value)} <span className="text-[var(--color-text-muted)] font-normal text-[10px]">mol/L</span>
        </span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[9px] text-[var(--color-text-muted)] w-6 text-right">10ⁿ</span>
        <input
          type="range"
          min={-7}
          max={1}
          step={1}
          value={exp}
          className="flex-1"
          onChange={(e) => {
            const newExp = parseInt(e.target.value);
            onChange(Math.min(10, +(mant * Math.pow(10, newExp)).toPrecision(4)));
          }}
        />
        <span className="font-mono text-[10px] w-8 text-right" style={{ color }}>
          10<sup>{exp}</sup>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-[var(--color-text-muted)] w-6 text-right">×</span>
        <input
          type="range"
          min={1}
          max={9.99}
          step={0.01}
          value={mant.toFixed(2)}
          className="flex-1"
          onChange={(e) => {
            const newMant = parseFloat(e.target.value);
            onChange(Math.min(10, +(newMant * Math.pow(10, exp)).toPrecision(4)));
          }}
        />
        <span className="font-mono text-[10px] w-8 text-right" style={{ color }}>
          {mant.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
