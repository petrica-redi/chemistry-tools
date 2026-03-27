'use client';

import { GAS_DB, type Gas, formatTemp } from './VdWEngine';
import Panel from '@/components/shared/Panel';

interface Props {
  gasId: string;
  gas: Gas;
  onGasChange: (id: string) => void;
}

export default function GasSelector({ gasId, gas, onGasChange }: Props) {
  const groups: Record<string, Gas[]> = {};
  for (const g of GAS_DB) {
    if (!groups[g.cat]) groups[g.cat] = [];
    groups[g.cat].push(g);
  }

  const Vc = 3 * gas.b;

  return (
    <Panel title="Gas Selection">
      <select value={gasId} onChange={(e) => onGasChange(e.target.value)} className="mb-2">
        {Object.entries(groups).map(([cat, gases]) => (
          <optgroup key={cat} label={cat}>
            {gases.map((g) => (
              <option key={g.id} value={g.id}>
                {g.formula} — {g.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 border border-[var(--color-border)] font-mono text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        <div>
          <span className="text-[var(--color-text-primary)] font-semibold">a</span>={gas.a.toFixed(4)}{' '}
          <span className="text-[var(--color-text-muted)]">|</span>{' '}
          <span className="text-[var(--color-text-primary)] font-semibold">b</span>={gas.b.toFixed(5)}
        </div>
        <div>
          <span className="text-[var(--color-accent-red)] font-semibold">T<sub>c</sub></span>={formatTemp(gas.Tc)}{' '}
          <span className="text-[var(--color-text-muted)]">|</span>{' '}
          <span className="text-[var(--color-accent-red)] font-semibold">P<sub>c</sub></span>={gas.Pc.toFixed(1)} atm
        </div>
        <div>
          <span className="text-[var(--color-accent-green)] font-semibold">T<sub>t</sub></span>={formatTemp(gas.Tt)}{' '}
          <span className="text-[var(--color-text-muted)]">|</span>{' '}
          <span className="text-[var(--color-accent-green)] font-semibold">P<sub>t</sub></span>={gas.Pt < 0.01 ? gas.Pt.toExponential(2) : gas.Pt.toFixed(3)} atm
        </div>
        <div>
          <span className="text-[var(--color-accent-cyan)] font-semibold">V<sub>c</sub></span>={Vc.toFixed(4)} L/mol
        </div>
      </div>
    </Panel>
  );
}
