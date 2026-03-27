'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Gas } from './VdWEngine';
import {
  vdwP,
  maxwell,
  computeBinodal,
  computeSpinodal,
  tempColor,
  formatTempShort,
  formatTemp,
} from './VdWEngine';
import GasSelector from './GasSelector';
import Panel from '@/components/shared/Panel';
import SliderControl from '@/components/shared/SliderControl';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

interface Props {
  gas: Gas;
  gasId: string;
  onGasChange: (id: string) => void;
}

interface State2D {
  tMin: number;
  tMax: number;
  vMin: number;
  vMax: number;
  pMin: number;
  pMax: number;
  showCritical: boolean;
  showMaxwell: boolean;
  showEqualAreas: boolean;
  eaIsotherm: number;
  showLiqZone: boolean;
  showBinodal: boolean;
  showSpinodal: boolean;
  showIdeal: boolean;
}

function defaultState(gas: Gas): State2D {
  const Vc = 3 * gas.b;
  return {
    tMin: Math.round(gas.Tc * 0.8),
    tMax: Math.round(gas.Tc * 1.3),
    vMin: Math.max(0.01, +(gas.b * 1.1).toFixed(2)),
    vMax: Math.min(10, +(Vc * 12).toFixed(2)),
    pMin: Math.max(-50, Math.round(-gas.Pc * 0.1)),
    pMax: Math.min(500, Math.round(gas.Pc * 2.5)),
    showCritical: false,
    showMaxwell: false,
    showEqualAreas: false,
    eaIsotherm: 3,
    showLiqZone: false,
    showBinodal: false,
    showSpinodal: false,
    showIdeal: false,
  };
}

export default function VdW2DPanel({ gas, gasId, onGasChange }: Props) {
  const [s, setS] = useState<State2D>(() => defaultState(gas));
  const plotRef = useRef<HTMLDivElement>(null);
  const PlotlyRef = useRef<any>(null);

  useEffect(() => {
    setS(defaultState(gas));
  }, [gas]);

  const update = useCallback((patch: Partial<State2D>) => {
    setS((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    let mounted = true;
    import('plotly.js-dist-min').then((Plotly) => {
      if (!mounted || !plotRef.current) return;
      PlotlyRef.current = Plotly.default || Plotly;
      renderPlot();
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (PlotlyRef.current && plotRef.current) renderPlot();
  }, [s, gas]);

  function renderPlot() {
    const Plotly = PlotlyRef.current;
    if (!Plotly || !plotRef.current) return;

    const { a, b: bp, Tc, Pc } = gas;
    const Vc = 3 * bp;
    const nP = 500;
    const traces: any[] = [];
    const temps: number[] = [];
    for (let i = 0; i < 12; i++) temps.push(s.tMin + (s.tMax - s.tMin) * i / 11);

    // Liquefaction zone
    if (s.showLiqZone) {
      const bn = computeBinodal(a, bp, Tc);
      if (bn.length > 2) {
        traces.push({
          x: [...bn.map((p) => p.Vl), ...bn.map((p) => p.Vg).reverse()],
          y: [...bn.map((p) => p.P), ...bn.map((p) => p.P).reverse()],
          fill: 'toself',
          fillcolor: 'rgba(96,165,250,.15)',
          line: { color: 'transparent' },
          name: 'Liquefaction zone',
          hoverinfo: 'skip',
        });
      }
    }

    // Binodal
    if (s.showBinodal) {
      const bn = computeBinodal(a, bp, Tc);
      if (bn.length > 2) {
        traces.push({
          x: [...bn.map((p) => p.Vl), ...bn.map((p) => p.Vg).reverse()],
          y: [...bn.map((p) => p.P), ...bn.map((p) => p.P).reverse()],
          mode: 'lines',
          line: { color: '#f472b6', width: 2.5, dash: 'dash' },
          name: 'Binodal',
        });
      }
    }

    // Spinodal
    if (s.showSpinodal) {
      const sp = computeSpinodal(a, bp);
      const left = sp.filter((p) => p.V <= Vc * 1.1).sort((x, y) => x.V - y.V);
      const right = sp.filter((p) => p.V >= Vc * 0.9).sort((x, y) => x.V - y.V);
      if (left.length > 2) {
        traces.push({
          x: left.map((p) => p.V), y: left.map((p) => p.P),
          mode: 'lines', line: { color: '#a78bfa', width: 2, dash: 'dot' }, name: 'Spinodal',
        });
      }
      if (right.length > 2) {
        traces.push({
          x: right.map((p) => p.V), y: right.map((p) => p.P),
          mode: 'lines', line: { color: '#a78bfa', width: 2, dash: 'dot' }, showlegend: false,
        });
      }
    }

    // Isotherms
    for (let ti = 0; ti < 12; ti++) {
      const T = temps[ti];
      const f = ti / 11;
      const col = tempColor(f);
      const isNearTc = Math.abs(T - Tc) < (s.tMax - s.tMin) / 24;
      const isSubcritical = T < Tc;
      const vA: number[] = [], pA: number[] = [];
      for (let i = 0; i <= nP; i++) {
        const V = s.vMin + (s.vMax - s.vMin) * i / nP;
        const P = vdwP(V, T, a, bp);
        if (!isNaN(P)) { vA.push(V); pA.push(P); }
      }
      traces.push({
        x: vA, y: pA, mode: 'lines',
        line: { color: col, width: isNearTc ? 3 : 1.8 },
        name: `T=${formatTempShort(T)}${isNearTc ? ' ≈Tc' : ''}`,
        hovertemplate: `V=%{x:.4f}<br>P=%{y:.2f} atm<br>T=${formatTemp(T)}<extra></extra>`,
      });

      // Maxwell plateaus
      if ((s.showMaxwell || (s.showEqualAreas && ti === s.eaIsotherm - 1)) && isSubcritical) {
        const mc = maxwell(T, a, bp);
        if (mc && mc.Vl >= s.vMin) {
          traces.push({
            x: [mc.Vl, mc.Vg], y: [mc.Peq, mc.Peq],
            mode: 'lines+markers', line: { color: col, width: 2.5 },
            marker: { color: col, size: 5 }, showlegend: false, hoverinfo: 'skip',
          });
        }
      }
    }

    // Ideal gas
    if (s.showIdeal) {
      const Tmid = (s.tMin + s.tMax) / 2;
      const vI: number[] = [], pI: number[] = [];
      for (let i = 0; i <= nP; i++) {
        const V = s.vMin + (s.vMax - s.vMin) * i / nP;
        if (V > 0) { vI.push(V); pI.push(0.082057 * Tmid / V); }
      }
      traces.push({
        x: vI, y: pI, mode: 'lines',
        line: { color: '#64748b', width: 1.5, dash: 'dashdot' },
        name: `Ideal gas (${formatTempShort(Tmid)})`,
      });
    }

    // Critical point
    if (s.showCritical) {
      traces.push({
        x: [Vc], y: [Pc], mode: 'markers+text',
        marker: { color: '#ef4444', size: 12, symbol: 'star', line: { color: '#fff', width: 1.5 } },
        text: [` C (${formatTemp(Tc)})`], textposition: 'top right',
        textfont: { color: '#ef4444', size: 12 }, name: 'Critical point',
      });
    }

    const layout = {
      xaxis: {
        title: '<b>V</b> (L/mol)', range: [s.vMin, s.vMax],
        gridcolor: 'rgba(100,140,200,.08)', tickfont: { family: 'monospace', size: 11, color: '#64748b' },
        color: '#94a3b8',
      },
      yaxis: {
        title: '<b>P</b> (atm)', range: [s.pMin, s.pMax],
        gridcolor: 'rgba(100,140,200,.08)', zeroline: true, zerolinecolor: 'rgba(100,140,200,.15)',
        tickfont: { family: 'monospace', size: 11, color: '#64748b' }, color: '#94a3b8',
      },
      margin: { t: 45, r: 25, b: 55, l: 65 },
      title: {
        text: `<b>${gas.formula} (${gas.name})</b> — P-V Isotherms`,
        font: { family: 'system-ui', size: 16, color: '#e2e8f0' }, y: 0.97,
      },
      legend: { x: 1, y: 1, xanchor: 'right', bgcolor: 'rgba(6,10,18,.9)', font: { size: 10.5, color: '#94a3b8' } },
      plot_bgcolor: '#0c1220',
      paper_bgcolor: '#0c1220',
      hovermode: 'closest',
    };

    Plotly.react(plotRef.current, traces, layout, {
      responsive: true, displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    });
  }

  return (
    <div className="flex h-full">
      <div className="w-[300px] min-w-[300px] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 flex flex-col gap-3">
        <GasSelector gasId={gasId} gas={gas} onGasChange={onGasChange} />

        <Panel title="Temperature Range">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">T<sub>min</sub> (K)</label>
              <input
                type="number"
                value={s.tMin}
                onChange={(e) => update({ tMin: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">T<sub>max</sub> (K)</label>
              <input
                type="number"
                value={s.tMax}
                onChange={(e) => update({ tMax: +e.target.value })}
              />
            </div>
          </div>
          <p className="text-[9px] text-[var(--color-text-muted)] mt-1 font-mono">12 isotherms</p>
        </Panel>

        <Panel title="Axis Ranges">
          <SliderControl label="V min" value={s.vMin} min={0.01} max={2} step={0.01} unit=" L/mol" onChange={(v) => update({ vMin: v })} />
          <SliderControl label="V max" value={s.vMax} min={0.1} max={10} step={0.05} unit=" L/mol" onChange={(v) => update({ vMax: v })} />
          <SliderControl label="P min" value={s.pMin} min={-50} max={50} step={1} unit=" atm" onChange={(v) => update({ pMin: v })} />
          <SliderControl label="P max" value={s.pMax} min={10} max={500} step={5} unit=" atm" onChange={(v) => update({ pMax: v })} />
        </Panel>

        <Panel title="Display Options">
          <ToggleSwitch label="Critical point" checked={s.showCritical} onChange={(v) => update({ showCritical: v })} color="var(--color-accent-red)" />
          <ToggleSwitch label="Maxwell plateaus" checked={s.showMaxwell} onChange={(v) => update({ showMaxwell: v })} color="var(--color-accent-yellow)" />
          <ToggleSwitch label="Equal areas" checked={s.showEqualAreas} onChange={(v) => update({ showEqualAreas: v })} color="var(--color-accent-orange)" />
          {s.showEqualAreas && (
            <SliderControl label="Isotherm #" value={s.eaIsotherm} min={1} max={12} step={1} onChange={(v) => update({ eaIsotherm: v })} />
          )}
          <ToggleSwitch label="Liquefaction zone" checked={s.showLiqZone} onChange={(v) => update({ showLiqZone: v })} color="var(--color-accent-blue)" />
          <ToggleSwitch label="Binodal" checked={s.showBinodal} onChange={(v) => update({ showBinodal: v })} color="var(--color-accent-pink)" />
          <ToggleSwitch label="Spinodal" checked={s.showSpinodal} onChange={(v) => update({ showSpinodal: v })} color="var(--color-accent-purple)" />
          <ToggleSwitch label="Ideal gas" checked={s.showIdeal} onChange={(v) => update({ showIdeal: v })} />
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="text-[12px] font-semibold py-2 rounded-lg bg-[var(--color-accent-blue)] text-white hover:opacity-90 transition"
            onClick={() => setS(defaultState(gas))}
          >
            Reset
          </button>
          <button
            className="text-[12px] font-semibold py-2 rounded-lg border border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/10 transition"
            onClick={() => {
              const Vc = 3 * gas.b;
              update({
                vMin: Math.max(0.01, +(gas.b * 1.1).toFixed(2)),
                vMax: Math.min(10, +(Vc * 12).toFixed(2)),
                pMin: Math.max(-50, Math.round(-gas.Pc * 0.1)),
                pMax: Math.min(500, Math.round(gas.Pc * 2.5)),
              });
            }}
          >
            Auto Range
          </button>
        </div>
      </div>
      <div className="flex-1 p-3 min-w-0">
        <div ref={plotRef} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}
