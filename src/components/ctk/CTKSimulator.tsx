'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  CTK_GASES,
  GAS_KEYS,
  type MixGas,
  type CTKParams,
  DEFAULT_PARAMS,
} from './CTKGasDB';
import { runSimulation, type SimResult } from './CTKEngine';
import TabBar from '@/components/shared/TabBar';
import Panel from '@/components/shared/Panel';
import RelatedTools from '@/components/shared/RelatedTools';

// Dynamic import for 3D component
const CTK3DView = dynamic(() => import('./CTK3DView'), { ssr: false });
import { CTK_TO_VDW } from '@/lib/connections';
import { CHART_LIGHT } from '@/lib/chart-theme';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(LineController, LineElement, PointElement, LinearScale, Tooltip, Legend, annotationPlugin);

const TABS = [
  { id: 'panel', label: 'Gas Panel' },
  { id: 'params', label: 'Parameters' },
  { id: 'results', label: 'Results' },
  { id: 'cfd', label: '3D CFD' },
];

interface Props { initialGasA?: string; }

export default function CTKSimulator({ initialGasA }: Props = {}) {
  const [tab, setTab] = useState('panel');
  const [mixA, setMixA] = useState<MixGas[]>(() => {
    if (initialGasA && CTK_GASES[initialGasA]) {
      return [{ g: initialGasA, f: 10 }, { g: 'He', f: 40 }, { g: 'none', f: 0 }, { g: 'none', f: 0 }];
    }
    return [{ g: 'H2', f: 10 }, { g: 'He', f: 40 }, { g: 'none', f: 0 }, { g: 'none', f: 0 }];
  });
  const [mixB, setMixB] = useState<MixGas[]>([
    { g: 'H2', f: 10 }, { g: 'CO', f: 5 }, { g: 'Ar', f: 35 }, { g: 'none', f: 0 },
  ]);
  const [params, setParams] = useState<CTKParams>(DEFAULT_PARAMS);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);
  const [visibleGases, setVisibleGases] = useState<Record<string, boolean>>({});
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart | null>(null);

  const updateMix = useCallback((which: 'A' | 'B', idx: number, field: 'g' | 'f', value: string | number) => {
    const setter = which === 'A' ? setMixA : setMixB;
    setter((prev) => {
      const next = [...prev];
      if (field === 'g') {
        next[idx] = { ...next[idx], g: value as string };
        if (value === 'none') next[idx].f = 0;
      } else {
        next[idx] = { ...next[idx], f: value as number };
      }
      return next;
    });
  }, []);

  const updateParam = useCallback((key: keyof CTKParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const doSim = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const result = runSimulation(mixA, mixB, params);
      setSimResult(result);
      const vg: Record<string, boolean> = {};
      result.gasKeys.forEach((k) => (vg[k] = true));
      setVisibleGases(vg);
      setRunning(false);
      setTab('results');
    }, 30);
  }, [mixA, mixB, params]);

  useEffect(() => {
    if (!simResult || tab !== 'results' || !chartRef.current) return;
    buildChart();
  }, [simResult, tab, visibleGases]);

  function buildChart() {
    if (!simResult || !chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    if (chartInst.current) chartInst.current.destroy();

    const R = simResult;
    const ds = R.gasKeys.map((k) => ({
      label: CTK_GASES[k]?.label || k,
      data: R.data.map((d) => ({ x: d.t, y: d[k] })),
      borderColor: CTK_GASES[k]?.color || '#fff',
      backgroundColor: (CTK_GASES[k]?.color || '#fff') + '22',
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 6,
      tension: 0.15,
      hidden: !visibleGases[k],
    }));

    let mY = 0;
    R.data.forEach((d) => R.gasKeys.forEach((k) => { if (d[k] > mY) mY = d[k]; }));
    mY = Math.ceil(mY * 1.08);

    const annotations: Record<string, any> = {
      pA1: { type: 'box', xMin: 0, xMax: R.switchToB, backgroundColor: 'rgba(239,68,68,.04)', borderWidth: 0 },
      pB: { type: 'box', xMin: R.switchToB, xMax: R.switchBackToA, backgroundColor: 'rgba(96,165,250,.04)', borderWidth: 0 },
      pA2: { type: 'box', xMin: R.switchBackToA, xMax: R.totalTime, backgroundColor: 'rgba(239,68,68,.04)', borderWidth: 0 },
      sw1: {
        type: 'line', xMin: R.switchToB, xMax: R.switchToB,
        borderColor: '#d97706', borderWidth: 2, borderDash: [6, 4],
        label: {
          display: true,
          content: `A→B t=${R.switchToB}s`,
          position: 'end',
          color: '#92400e',
          backgroundColor: CHART_LIGHT.labelBg,
          borderColor: CHART_LIGHT.tooltipBorder,
          borderWidth: 1,
          font: { size: 8, family: 'monospace' },
          padding: 4,
        },
      },
      sw2: {
        type: 'line', xMin: R.switchBackToA, xMax: R.switchBackToA,
        borderColor: '#d97706', borderWidth: 2, borderDash: [6, 4],
        label: {
          display: true,
          content: `B→A t=${R.switchBackToA}s`,
          position: 'end',
          color: '#92400e',
          backgroundColor: CHART_LIGHT.labelBg,
          borderColor: CHART_LIGHT.tooltipBorder,
          borderWidth: 1,
          font: { size: 8, family: 'monospace' },
          padding: 4,
        },
      },
    };

    chartInst.current = new Chart(ctx, {
      type: 'line',
      data: { datasets: ds },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: CHART_LIGHT.legendText,
              font: { family: 'monospace', size: 10 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 10,
            },
          },
          tooltip: {
            backgroundColor: CHART_LIGHT.tooltipBg,
            borderColor: CHART_LIGHT.tooltipBorder,
            borderWidth: 1,
            titleFont: { family: 'monospace', size: 11 },
            bodyFont: { family: 'monospace', size: 10 },
            titleColor: CHART_LIGHT.tooltipTitle,
            bodyColor: CHART_LIGHT.tooltipBody,
            padding: 8,
            cornerRadius: 8,
            callbacks: {
              title: (items: any[]) => `t = ${items[0]?.parsed?.x?.toFixed(2) ?? ''} s`,
              label: (c: any) => {
                const k = R.gasKeys[c.datasetIndex];
                return ` ${CTK_GASES[k]?.label || k}: ${c.parsed.y.toFixed(3)} kPa`;
              },
            },
          },
          annotation: { annotations },
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Time (s)',
              color: CHART_LIGHT.axisTitle,
              font: { family: 'monospace', size: 12 },
            },
            ticks: { color: CHART_LIGHT.tick, font: { family: 'monospace', size: 10 }, maxTicksLimit: 15 },
            grid: { color: CHART_LIGHT.grid },
            border: { color: CHART_LIGHT.axisLine },
            min: 0,
            max: R.totalTime,
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Partial pressure (kPa)',
              color: CHART_LIGHT.axisTitle,
              font: { family: 'monospace', size: 12 },
            },
            ticks: {
              color: CHART_LIGHT.tick,
              font: { family: 'monospace', size: 10 },
              maxTicksLimit: 10,
              callback: (v: any) => v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2),
            },
            grid: { color: CHART_LIGHT.grid },
            border: { color: CHART_LIGHT.axisLine },
            min: 0,
            suggestedMax: mY,
          },
        },
      },
    });
  }

  const toggleGas = useCallback((k: string) => {
    setVisibleGases((prev) => ({ ...prev, [k]: !prev[k] }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Valve Schematic */}
      <div className="border-b border-[var(--color-border)] px-4 py-2 text-center bg-[var(--color-bg-secondary)]">
        <svg viewBox="0 0 560 175" className="w-full max-w-[530px] mx-auto" xmlns="http://www.w3.org/2000/svg">
          <line x1="10" y1="52" x2="92" y2="52" stroke="#ef4444" strokeWidth="3"/>
          <polygon points="83,48 93,52 83,56" fill="#ef4444"/>
          <text x="10" y="44" fill="#ef4444" fontSize="10" fontWeight="700" fontFamily="monospace">Mix A</text>
          <line x1="10" y1="120" x2="92" y2="120" stroke="#60a5fa" strokeWidth="3"/>
          <polygon points="83,116 93,120 83,124" fill="#60a5fa"/>
          <text x="10" y="112" fill="#60a5fa" fontSize="10" fontWeight="700" fontFamily="monospace">Mix B</text>
          <circle cx="118" cy="86" r="18" fill="#111827" stroke="#fbbf24" strokeWidth="2"/>
          <text x="118" y="90" fill="#fbbf24" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">1</text>
          <line x1="93" y1="52" x2="106" y2="74" stroke="#ef4444" strokeWidth="2"/>
          <line x1="93" y1="120" x2="106" y2="98" stroke="#60a5fa" strokeWidth="2"/>
          <line x1="136" y1="86" x2="208" y2="86" stroke="#94a3b8" strokeWidth="2"/>
          <polygon points="201,82 211,86 201,90" fill="#94a3b8"/>
          <circle cx="233" cy="86" r="18" fill="#111827" stroke="#fbbf24" strokeWidth="2"/>
          <text x="233" y="90" fill="#fbbf24" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">2</text>
          <line x1="233" y1="104" x2="233" y2="136" stroke="#94a3b8" strokeWidth="2"/>
          <polygon points="229,131 233,141 237,131" fill="#94a3b8"/>
          <rect x="216" y="143" width="34" height="26" rx="4" fill="#0c1220" stroke="#60a5fa" strokeWidth="1.5"/>
          <text x="233" y="157" fill="#60a5fa" fontSize="7" textAnchor="middle" fontFamily="monospace">Reactor</text>
          <line x1="251" y1="86" x2="308" y2="86" stroke="#34d399" strokeWidth="2"/>
          <circle cx="288" cy="48" r="10" fill="rgba(251,146,60,.07)" stroke="#fb923c" strokeWidth="1.5"/>
          <line x1="288" y1="58" x2="288" y2="86" stroke="#fb923c" strokeWidth="1.5"/>
          <text x="288" y="52" fill="#fb923c" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Ne</text>
          <circle cx="333" cy="86" r="18" fill="#111827" stroke="#fbbf24" strokeWidth="2"/>
          <text x="333" y="90" fill="#fbbf24" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">3</text>
          <line x1="351" y1="86" x2="413" y2="86" stroke="#34d399" strokeWidth="2"/>
          <polygon points="406,82 416,86 406,90" fill="#34d399"/>
          <rect x="418" y="72" width="60" height="28" rx="4" fill="#111827" stroke="#34d399" strokeWidth="1.5"/>
          <text x="448" y="85" fill="#34d399" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="monospace">MS Quad.</text>
          <text x="448" y="95" fill="#34d399" fontSize="7" textAnchor="middle" fontFamily="monospace">Capillary</text>
        </svg>
      </div>

      <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />

      <div className="flex-1 overflow-y-auto p-4">
        {/* Gas Panel */}
        {tab === 'panel' && (
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'A', color: '#ef4444', mix: mixA, which: 'A' as const },
              { label: 'B', color: '#60a5fa', mix: mixB, which: 'B' as const },
            ].map(({ label, color, mix, which }) => {
              const total = mix.reduce((s, g) => s + (g.g !== 'none' ? g.f : 0), 0);
              return (
                <div key={which} className="flex-1 min-w-[270px] bg-[var(--color-bg-primary)] rounded-lg p-4 border" style={{ borderColor: color + '33' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-mono text-sm font-bold" style={{ color }}>MIX {label}</h3>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">
                      Σ=<span className="font-bold text-[var(--color-text-primary)]">{total.toFixed(1)}</span> mL/min
                    </span>
                  </div>
                  {mix.map((g, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2">
                      <div className="w-3 h-3 rounded-full border-2 border-[var(--color-border)] shrink-0" style={{ background: g.g !== 'none' ? CTK_GASES[g.g]?.color : '#334155' }} />
                      <select
                        className="flex-[1.3]"
                        value={g.g}
                        onChange={(e) => updateMix(which, i, 'g', e.target.value)}
                      >
                        <option value="none">— None —</option>
                        {GAS_KEYS.map((k) => (
                          <option key={k} value={k}>{CTK_GASES[k].label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="flex-[0.6] text-right"
                        min={0}
                        max={200}
                        step={0.5}
                        value={g.f}
                        disabled={g.g === 'none'}
                        onChange={(e) => updateMix(which, i, 'f', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-[9px] text-[var(--color-text-muted)] w-10 shrink-0">mL/min</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Parameters */}
        {tab === 'params' && (
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[210px]">
              <Panel title="Reactor">
                {[
                  { key: 'T' as const, label: 'Temperature', unit: '°C' },
                  { key: 'P' as const, label: 'Total pressure', unit: 'Pa' },
                  { key: 'rID' as const, label: 'Reactor inner Ø', unit: 'mm' },
                  { key: 'totalH' as const, label: 'Reactor volume height', unit: 'mm' },
                  { key: 'dp' as const, label: 'Catalyst particle Ø', unit: 'mm' },
                  { key: 'eps' as const, label: 'Void fraction ε', unit: '' },
                  { key: 'frit' as const, label: 'Frit P4 thickness', unit: 'mm' },
                  { key: 'bedH' as const, label: 'Catalyst bed height', unit: 'mm' },
                ].map(({ key, label, unit }) => (
                  <div key={key} className="mb-2">
                    <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={params[key]}
                        onChange={(e) => updateParam(key, parseFloat(e.target.value) || 0)}
                      />
                      {unit && <span className="text-[9px] text-[var(--color-text-muted)]">{unit}</span>}
                    </div>
                  </div>
                ))}
              </Panel>
            </div>
            <div className="flex-1 min-w-[210px]">
              <Panel title="Piping">
                {[
                  { key: 'tID' as const, label: 'Tube inner Ø', unit: 'mm' },
                  { key: 'Lin' as const, label: 'Valve → reactor length', unit: 'mm' },
                  { key: 'Lout' as const, label: 'Reactor → MS length', unit: 'mm' },
                ].map(({ key, label, unit }) => (
                  <div key={key} className="mb-2">
                    <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">{label}</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={params[key]} onChange={(e) => updateParam(key, parseFloat(e.target.value) || 0)} />
                      <span className="text-[9px] text-[var(--color-text-muted)]">{unit}</span>
                    </div>
                  </div>
                ))}
              </Panel>
              <div className="mt-3">
                <Panel title="Chronology">
                  {[
                    { key: 'tSW' as const, label: 'Build-up + steady state (B)', unit: 's' },
                    { key: 'tSS' as const, label: 'Steady state duration (B)', unit: 's' },
                    { key: 'tBT' as const, label: 'Back-transient duration', unit: 's' },
                    { key: 'neFlow' as const, label: 'Ne tracer flow', unit: 'mL/min' },
                  ].map(({ key, label, unit }) => (
                    <div key={key} className="mb-2">
                      <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">{label}</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={params[key]} onChange={(e) => updateParam(key, parseFloat(e.target.value) || 0)} />
                        <span className="text-[9px] text-[var(--color-text-muted)]">{unit}</span>
                      </div>
                    </div>
                  ))}
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {tab === 'results' && (
          <div>
            {simResult && (
              <>
                <div className="flex flex-wrap gap-3 p-3 bg-[var(--color-bg-primary)] rounded-lg mb-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
                  <span>Pe<sub>bed</sub>=<b className="text-[var(--color-text-primary)]">{simResult.Pe_bed}</b></span>
                  <span>Pe<sub>in</sub>=<b className="text-[var(--color-text-primary)]">{simResult.Pe_in}</b></span>
                  <span>Pe<sub>out</sub>=<b className="text-[var(--color-text-primary)]">{simResult.Pe_out}</b></span>
                  <span>V<sub>bed</sub>=<b className="text-[var(--color-text-primary)]">{simResult.V_bed_mL}</b> mL</span>
                  <span>V<sub>tot</sub>=<b className="text-[var(--color-text-primary)]">{simResult.V_total_mL}</b> mL</span>
                  <span>τ=<b className="text-[var(--color-text-primary)]">{simResult.tau_s}</b> s</span>
                  <span>N=<b className="text-[var(--color-text-primary)]">{simResult.nCells}</b></span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {simResult.gasKeys.map((k) => (
                    <button
                      key={k}
                      onClick={() => toggleGas(k)}
                      className="font-mono text-[10px] font-semibold px-2 py-1 rounded border transition-all"
                      style={{
                        background: visibleGases[k] ? (CTK_GASES[k]?.color || '#fff') + '22' : 'var(--color-bg-tertiary)',
                        borderColor: visibleGases[k] ? CTK_GASES[k]?.color || '#fff' : 'var(--color-border)',
                        color: visibleGases[k] ? CTK_GASES[k]?.color || '#fff' : 'var(--color-text-muted)',
                      }}
                    >
                      {CTK_GASES[k]?.label || k}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="relative w-full h-[400px] rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-sm">
              <canvas ref={chartRef} />
            </div>
            {!simResult && (
              <div className="text-center text-[var(--color-text-muted)] text-sm mt-8">
                Run the simulation to see results
              </div>
            )}
          </div>
        )}

        {/* 3D CFD */}
        {tab === 'cfd' && (
          <div className="h-full flex flex-col">
            <CTK3DView params={params} mixA={mixA} mixB={mixB} />
          </div>
        )}
      </div>

      {/* Simulate button + Related tools */}
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="text-center mb-4">
          <button
            onClick={doSim}
            disabled={running}
            className="px-10 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-mono font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-wait"
          >
            {running ? '⏳ Simulating...' : '▶ RUN SIMULATION'}
          </button>
          <div className="text-[8px] text-[var(--color-text-muted)] font-mono mt-2">
            Tanks-in-series · Fuller–Schettler–Giddings · Taylor · Frit P4 · Ne dilution
          </div>
        </div>
        {(() => {
          // Pick the first non-none gas from mix A for VdW deep link
          const firstGas = mixA.find((m) => m.g !== 'none');
          const vdwId = firstGas ? CTK_TO_VDW[firstGas.g] : undefined;
          return (
            <RelatedTools
              toolId="ctk"
              links={vdwId ? { vdw: `?gas=${vdwId}` } : {}}
            />
          );
        })()}
      </div>
    </div>
  );
}
