'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Gas } from './VdWEngine';
import {
  vdwP,
  maxwell,
  computeBinodal,
  tempColor,
  formatTempShort,
  formatTemp,
  realPhaseDiagram,
  type BinodalPoint,
} from './VdWEngine';
import GasSelector from './GasSelector';
import { CHART_LIGHT } from '@/lib/chart-theme';
import Panel from '@/components/shared/Panel';
import SliderControl from '@/components/shared/SliderControl';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

interface Props {
  gas: Gas;
  gasId: string;
  onGasChange: (id: string) => void;
}

interface State3D {
  showSurface: boolean;
  showRawVdW: boolean;
  showIsotherms: boolean;
  numIsotherms: number;
  showCritical: boolean;
  showBinodal: boolean;
  showBiphase: boolean;
  showPTcurve: boolean;
  showRealPhase: boolean;
  showSupercritical: boolean;
  showPVprojection: boolean;
  showSources: boolean;
}

const DEFAULT_3D: State3D = {
  showSurface: true,
  showRawVdW: false,
  showIsotherms: true,
  numIsotherms: 10,
  showCritical: true,
  showBinodal: true,
  showBiphase: false,
  showPTcurve: true,
  showRealPhase: false,
  showSupercritical: false,
  showPVprojection: false,
  showSources: false,
};

export default function VdW3DPanel({ gas, gasId, onGasChange }: Props) {
  const [s, setS] = useState<State3D>(DEFAULT_3D);
  const [status, setStatus] = useState('Ready');
  const plotRef = useRef<HTMLDivElement>(null);
  const PlotlyRef = useRef<any>(null);
  const bnRef = useRef<BinodalPoint[]>([]);

  const update = useCallback((patch: Partial<State3D>) => {
    setS((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    let mounted = true;
    import('plotly.js-dist-min').then((Plotly) => {
      if (!mounted || !plotRef.current) return;
      PlotlyRef.current = Plotly.default || Plotly;
      recompute();
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    recompute();
  }, [gas]);

  useEffect(() => {
    if (PlotlyRef.current && plotRef.current && bnRef.current.length > 0) renderPlot();
  }, [s]);

  function recompute() {
    setStatus('Computing...');
    setTimeout(() => {
      bnRef.current = computeBinodal(gas.a, gas.b, gas.Tc);
      setStatus(`Ready — ${bnRef.current.length} binodal pts`);
      if (PlotlyRef.current && plotRef.current) renderPlot();
    }, 30);
  }

  function renderPlot() {
    const Plotly = PlotlyRef.current;
    if (!Plotly || !plotRef.current) return;

    const { a, b, Tc, Pc, Tt, Pt } = gas;
    const Vc = 3 * b;
    const bn3 = bnRef.current;
    const Tm = Math.min(Tt * 0.7, Tc * 0.45);
    const TX = Tc * 1.4;
    const Vm = b * 1.15;
    const VX = Vc * 10;
    const PX = Pc * 2.5;
    const traces: any[] = [];

    const mcMap = new Map<number, { Peq: number; Vl: number; Vg: number }>();
    for (const p of bn3) mcMap.set(p.T, { Peq: p.P, Vl: p.Vl, Vg: p.Vg });

    function getMC(T: number) {
      if (T >= Tc) return null;
      let best: { Peq: number; Vl: number; Vg: number } | null = null;
      let bd = 1e9;
      for (const [tk, mc] of mcMap) {
        const d = Math.abs(tk - T);
        if (d < bd) { bd = d; best = mc; }
      }
      return best && bd < Tc * 0.015 ? best : maxwell(T, a, b);
    }

    // Surface
    if (s.showSurface || s.showRawVdW) {
      const nV = 70, nT = 50;
      const Vs: number[] = [], Ts: number[] = [];
      for (let i = 0; i <= nV; i++) { const f = i / nV; Vs.push(Vm + f * f * (VX - Vm)); }
      for (let j = 0; j <= nT; j++) Ts.push(Tm + (TX - Tm) * j / nT);

      if (s.showSurface) {
        const z: (number | null)[][] = [];
        for (const T of Ts) {
          const row: (number | null)[] = [];
          const mc = getMC(T);
          for (const V of Vs) {
            let P = vdwP(V, T, a, b);
            if (mc && V >= mc.Vl && V <= mc.Vg) P = mc.Peq;
            if (isNaN(P) || P < -PX * 0.1 || P > PX) row.push(null);
            else row.push(P);
          }
          z.push(row);
        }
        traces.push({
          type: 'surface', x: Vs, y: Ts, z,
          colorscale: [[0, '#1a3a6c'], [0.3, '#2980b9'], [0.5, '#48c9b0'], [0.7, '#f9e547'], [1, '#e74c3c']],
          opacity: 0.85, showscale: false, name: 'P(V,T) surface',
          hovertemplate: 'V=%{x:.4f}<br>T=%{y:.1f} K<br>P=%{z:.2f} atm<extra></extra>',
          lighting: { ambient: 0.6, diffuse: 0.5, specular: 0.15 },
        });
      }

      if (s.showRawVdW) {
        const z: (number | null)[][] = [];
        for (const T of Ts) {
          const row: (number | null)[] = [];
          for (const V of Vs) {
            const P = vdwP(V, T, a, b);
            if (isNaN(P) || P < -PX * 0.2 || P > PX) row.push(null);
            else row.push(P);
          }
          z.push(row);
        }
        traces.push({
          type: 'surface', x: Vs, y: Ts, z,
          colorscale: [[0, 'rgba(180,180,200,.4)'], [1, 'rgba(220,180,180,.4)']],
          opacity: 0.3, showscale: false, name: 'Raw VdW', hoverinfo: 'skip',
        });
      }
    }

    // 3D Isotherms
    if (s.showIsotherms) {
      for (let k = 0; k < s.numIsotherms; k++) {
        const T = Tm + (TX - Tm) * k / (s.numIsotherms - 1);
        const mc = getMC(T);
        const vA: number[] = [], tA: number[] = [], pA: number[] = [];
        for (let i = 0; i <= 200; i++) {
          const f = i / 200;
          const V = Vm + f * f * (VX - Vm);
          let P = vdwP(V, T, a, b);
          if (mc && V >= mc.Vl && V <= mc.Vg) P = mc.Peq;
          if (!isNaN(P) && P > 0 && P < PX) { vA.push(V); tA.push(T); pA.push(P); }
        }
        traces.push({
          type: 'scatter3d', x: vA, y: tA, z: pA, mode: 'lines',
          line: { color: tempColor(k / (s.numIsotherms - 1)), width: 3 },
          name: `T=${formatTempShort(T)}`,
        });
      }
    }

    // Binodal dome
    if (s.showBinodal && bn3.length > 2) {
      traces.push({
        type: 'scatter3d', x: bn3.map((p) => p.Vl), y: bn3.map((p) => p.T), z: bn3.map((p) => p.P),
        mode: 'lines', line: { color: '#e74c3c', width: 5 }, name: 'Binodal (liquid)',
      });
      traces.push({
        type: 'scatter3d', x: bn3.map((p) => p.Vg), y: bn3.map((p) => p.T), z: bn3.map((p) => p.P),
        mode: 'lines', line: { color: '#3498db', width: 5 }, name: 'Binodal (gas)',
      });
    }

    // Biphase surface
    if (s.showBiphase && bn3.length > 3) {
      const nV2 = 15;
      const vx: number[] = [], vy: number[] = [], vz: number[] = [];
      const fi: number[] = [], fj: number[] = [], fk: number[] = [];
      for (let j = 0; j < bn3.length; j++) {
        for (let i = 0; i <= nV2; i++) {
          const f = i / nV2;
          vx.push(bn3[j].Vl + (bn3[j].Vg - bn3[j].Vl) * f);
          vy.push(bn3[j].T);
          vz.push(bn3[j].P);
        }
      }
      const stride = nV2 + 1;
      for (let j = 0; j < bn3.length - 1; j++) {
        for (let i = 0; i < nV2; i++) {
          const a2 = j * stride + i;
          fi.push(a2, a2);
          fj.push(a2 + 1, (j + 1) * stride + i);
          fk.push((j + 1) * stride + i, (j + 1) * stride + i + 1);
        }
      }
      traces.push({
        type: 'mesh3d', x: vx, y: vy, z: vz, i: fi, j: fj, k: fk,
        color: 'rgba(231,76,60,.2)', flatshading: true, name: 'Two-phase', hoverinfo: 'skip', showscale: false,
      });
    }

    // Critical point
    if (s.showCritical) {
      traces.push({
        type: 'scatter3d', x: [Vc], y: [Tc], z: [Pc], mode: 'markers+text',
        marker: { size: 8, color: '#e03131', symbol: 'diamond', line: { color: '#fff', width: 2 } },
        text: ['C'], textposition: 'top center', textfont: { size: 12, color: '#e03131' },
        name: `C (${formatTempShort(Tc)})`,
        hovertemplate: `<b>Critical point</b><br>${formatTemp(Tc)}<br>${Pc.toFixed(1)} atm<extra></extra>`,
      });
    }

    // P-T projection
    if (s.showPTcurve && bn3.length > 2) {
      const bf = bn3.filter((p) => p.P > 0);
      traces.push({
        type: 'scatter3d', x: bf.map(() => VX), y: bf.map((p) => p.T), z: bf.map((p) => p.P),
        mode: 'lines', line: { color: '#94a3b8', width: 5 }, name: 'VdW vapor curve',
      });
    }

    // Real phase diagram
    if (s.showRealPhase) {
      const rpd = realPhaseDiagram(gas);
      traces.push({
        type: 'scatter3d', x: rpd.vT.map(() => VX), y: rpd.vT, z: rpd.vP,
        mode: 'lines', line: { color: '#e67e22', width: 4, dash: 'dash' }, name: 'Vaporization (exp.)',
      });
      if (rpd.sP.length > 2) {
        traces.push({
          type: 'scatter3d', x: rpd.sT.map(() => VX), y: rpd.sT, z: rpd.sP,
          mode: 'lines', line: { color: '#27ae60', width: 4, dash: 'dash' }, name: 'Sublimation (exp.)',
        });
      }
      if (rpd.mP.length > 2) {
        traces.push({
          type: 'scatter3d', x: rpd.mT.map(() => VX), y: rpd.mT, z: rpd.mP,
          mode: 'lines', line: { color: '#8e44ad', width: 4, dash: 'dash' }, name: 'Melting (exp.)',
        });
      }
      traces.push({
        type: 'scatter3d', x: [VX], y: [Tt], z: [Pt], mode: 'markers+text',
        marker: { size: 6, color: '#27ae60' },
        text: [`  Tp (${formatTempShort(Tt)})`], textposition: 'middle right',
        textfont: { size: 10, color: '#27ae60' }, name: `Triple pt (${formatTempShort(Tt)})`,
      });
    }

    // Supercritical
    if (s.showSupercritical) {
      const n2 = 20;
      const sx: number[] = [], sy: number[] = [], sz: number[] = [];
      const si: number[] = [], sj: number[] = [], sk: number[] = [];
      for (let j = 0; j <= n2; j++) {
        for (let i = 0; i <= n2; i++) {
          sx.push(VX);
          sy.push(Tc + (TX - Tc) * j / n2);
          sz.push(Pc + (PX - Pc) * i / n2);
        }
      }
      const st = n2 + 1;
      for (let j = 0; j < n2; j++) {
        for (let i = 0; i < n2; i++) {
          const a2 = j * st + i;
          si.push(a2, a2); sj.push(a2 + 1, a2 + st); sk.push(a2 + st, (j + 1) * st + i + 1);
        }
      }
      traces.push({
        type: 'mesh3d', x: sx, y: sy, z: sz, i: si, j: sj, k: sk,
        color: 'rgba(255,165,0,.12)', flatshading: true, name: 'Supercritical', hoverinfo: 'skip', showscale: false,
      });
    }

    // P-V projection
    if (s.showPVprojection) {
      const pts2 = [Tc * 0.7, Tc * 0.85, Tc, Tc * 1.15, Tc * 1.3];
      for (const T of pts2) {
        const mc = getMC(T);
        const vA: number[] = [], pA2: number[] = [];
        for (let i = 0; i <= 150; i++) {
          const f = i / 150;
          const V = Vm + f * f * (VX - Vm);
          let P = vdwP(V, T, a, b);
          if (mc && V >= mc.Vl && V <= mc.Vg) P = mc.Peq;
          if (!isNaN(P) && P > 0 && P < PX) { vA.push(V); pA2.push(P); }
        }
        traces.push({
          type: 'scatter3d', x: vA, y: vA.map(() => TX), z: pA2, mode: 'lines',
          line: { color: Math.abs(T - Tc) < Tc * 0.02 ? '#e03131' : '#64748b', width: Math.abs(T - Tc) < Tc * 0.02 ? 3 : 2, dash: Math.abs(T - Tc) < Tc * 0.02 ? 'solid' : 'dash' },
          showlegend: false,
        });
      }
    }

    const sceneAxis = {
      gridcolor: CHART_LIGHT.grid,
      showbackground: true,
      backgroundcolor: CHART_LIGHT.sceneBg,
      color: CHART_LIGHT.tick,
      titlefont: { color: CHART_LIGHT.axisTitle, size: 11 },
    };
    const layout = {
      scene: {
        xaxis: { title: 'V (L/mol)', range: [Vm, VX], ...sceneAxis },
        yaxis: { title: 'T (K)', range: [Tm, TX], ...sceneAxis },
        zaxis: { title: 'P (atm)', range: [0, PX], ...sceneAxis },
        aspectratio: { x: 1.2, y: 1, z: 0.9 },
        camera: { eye: { x: 1.8, y: -1.6, z: 0.8 } },
      },
      margin: { t: 40, r: 10, b: 10, l: 10 },
      title: {
        text: `<b>${gas.formula} (${gas.name})</b> — P-V-T Surface`,
        font: { family: 'system-ui', size: 16, color: CHART_LIGHT.title },
        y: 0.97,
      },
      legend: {
        x: 0,
        y: 1,
        bgcolor: CHART_LIGHT.legendBg,
        bordercolor: CHART_LIGHT.legendBorder,
        borderwidth: 1,
        font: { size: 10, color: CHART_LIGHT.legendText },
      },
      paper_bgcolor: CHART_LIGHT.paperBg,
    };

    Plotly.react(plotRef.current, traces, layout, { responsive: true, displaylogo: false });
  }

  function setView(v: string) {
    const Plotly = PlotlyRef.current;
    if (!Plotly || !plotRef.current) return;
    const views: Record<string, any> = {
      per: { eye: { x: 1.8, y: -1.6, z: 0.8 }, up: { x: 0, y: 0, z: 1 } },
      PV: { eye: { x: 0.001, y: -2.5, z: 0.3 }, up: { x: 0, y: 0, z: 1 } },
      PT: { eye: { x: 2.5, y: 0.001, z: 0.3 }, up: { x: 0, y: 0, z: 1 } },
      VT: { eye: { x: 0.001, y: 0.001, z: 3 }, up: { x: 0, y: 1, z: 0 } },
    };
    Plotly.relayout(plotRef.current, { 'scene.camera': views[v] || views.per });
  }

  return (
    <div className="flex h-full">
      <div className="w-[300px] min-w-[300px] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 flex flex-col gap-3">
        <GasSelector gasId={gasId} gas={gas} onGasChange={onGasChange} />

        <Panel title="Surface">
          <ToggleSwitch label="Corrected surface" checked={s.showSurface} onChange={(v) => update({ showSurface: v })} color="var(--color-accent-blue)" />
          <ToggleSwitch label="Raw VdW surface" checked={s.showRawVdW} onChange={(v) => update({ showRawVdW: v })} />
          <ToggleSwitch label="3D isotherms" checked={s.showIsotherms} onChange={(v) => update({ showIsotherms: v })} color="var(--color-accent-cyan)" />
          {s.showIsotherms && (
            <SliderControl label="# isotherms" value={s.numIsotherms} min={4} max={20} step={1} onChange={(v) => update({ numIsotherms: v })} />
          )}
        </Panel>

        <Panel title="Elements">
          <ToggleSwitch label="Critical point" checked={s.showCritical} onChange={(v) => update({ showCritical: v })} color="var(--color-accent-red)" />
          <ToggleSwitch label="Binodal dome" checked={s.showBinodal} onChange={(v) => update({ showBinodal: v })} color="var(--color-accent-pink)" />
          <ToggleSwitch label="Two-phase surface" checked={s.showBiphase} onChange={(v) => update({ showBiphase: v })} color="var(--color-accent-orange)" />
        </Panel>

        <Panel title="Phase Diagram (P-T wall)">
          <ToggleSwitch label="VdW P(T) curve" checked={s.showPTcurve} onChange={(v) => update({ showPTcurve: v })} />
          <ToggleSwitch label="Real diagram (exp.)" checked={s.showRealPhase} onChange={(v) => update({ showRealPhase: v })} color="var(--color-accent-orange)" />
          <ToggleSwitch label="Supercritical zone" checked={s.showSupercritical} onChange={(v) => update({ showSupercritical: v })} color="var(--color-accent-yellow)" />
          <ToggleSwitch label="P-V projection" checked={s.showPVprojection} onChange={(v) => update({ showPVprojection: v })} />
        </Panel>

        <Panel title="Viewpoint">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'per', label: 'Perspective' },
              { id: 'PV', label: 'P-V face' },
              { id: 'PT', label: 'P-T face' },
              { id: 'VT', label: 'V-T top' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className="text-[11px] font-semibold py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] transition"
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            className="w-full mt-2 text-[12px] font-semibold py-2 rounded-lg bg-[var(--color-accent-blue)] text-white hover:opacity-90 transition"
            onClick={recompute}
          >
            Recalculate
          </button>
        </Panel>

        <div className="border-t border-[var(--color-border)] pt-3">
          <button
            onClick={() => update({ showSources: !s.showSources })}
            className="w-full text-left text-[12px] font-semibold py-2 px-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] transition flex items-center justify-between"
          >
            <span>Sources & References</span>
            <span className={`transform transition-transform ${s.showSources ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {s.showSources && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[10px] leading-relaxed text-[var(--color-text-muted)] space-y-2">
              <div>
                <strong className="text-[var(--color-text-secondary)]">Critical & Triple Points:</strong>
                <div className="text-[9px] mt-1">
                  — NIST Chemistry WebBook (webbook.nist.gov)<br />
                  — Young, H.D., <em>Univ. Physics</em>, 8th Ed., Tab. 16-3<br />
                  — HyperPhysics, Georgia State University
                </div>
              </div>
              <div>
                <strong className="text-[var(--color-text-secondary)]">Van der Waals Parameters:</strong>
                <div className="text-[9px] mt-1">
                  — Atkins, P.W., <em>Physical Chemistry</em>, 10th Ed.<br />
                  — Poling, B.E. et al., <em>Properties of Gases & Liquids</em>, 5th Ed., McGraw-Hill, 2000
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-secondary)]">
        <div
          ref={plotRef}
          className="flex-1 min-h-[280px] mx-3 mt-3 rounded-xl border border-[var(--color-border)] bg-white shadow-sm overflow-hidden"
        />
        <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--color-border)] text-[11px] font-mono text-[var(--color-text-muted)]">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: status.startsWith('Ready') ? '#34d399' : '#fbbf24' }}
          />
          {status}
        </div>
      </div>
    </div>
  );
}
