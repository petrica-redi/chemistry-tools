'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TOOLS } from '@/types';
import { CONNECTIONS, TOOL_META } from '@/lib/connections';

const TOOL_CONFIG: Record<string, {
  accent: string;
  iconBg: string;
  span?: string;
}> = {
  fim:       { accent: '#1d4ed8', iconBg: 'bg-blue-50', span: 'md:col-span-2' },
  ctk:       { accent: '#059669', iconBg: 'bg-emerald-50' },
  orbitals:  { accent: '#7c3aed', iconBg: 'bg-violet-50', span: 'md:col-span-2' },
  titration: { accent: '#db2777', iconBg: 'bg-pink-50' },
  miller:    { accent: '#ca8a04', iconBg: 'bg-amber-50' },
  vdw:       { accent: '#ea580c', iconBg: 'bg-orange-50' },
};

const BRIDGE_PAIRS = CONNECTIONS.filter((c, i, arr) =>
  arr.findIndex((x) => x.from === c.to && x.to === c.from) > i ||
  !arr.find((x) => x.from === c.to && x.to === c.from)
).slice(0, 4);

const STATS: { label: string; value: string; sub: string; icon: string }[] = [
  { label: 'Tools', value: '6', sub: 'simulators', icon: '⚗' },
  { label: 'Bridges', value: String(CONNECTIONS.length), sub: 'cross-links', icon: '🔗' },
  { label: 'Materials', value: '40+', sub: 'metals & gases', icon: '◎' },
  { label: 'Scales', value: '3D–QM', sub: 'atom to reactor', icon: '⬡' },
];

export default function DashboardView() {
  const [spotlight, setSpotlight] = useState(0);

  const pct = useMemo(() => (TOOLS.length <= 1 ? 0 : (spotlight / (TOOLS.length - 1)) * 100), [spotlight]);

  const activeTool = TOOLS[spotlight];

  const bump = useCallback((delta: number) => {
    setSpotlight((s) => {
      const n = s + delta;
      if (n < 0) return TOOLS.length - 1;
      if (n >= TOOLS.length) return 0;
      return n;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        bump(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        bump(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bump]);

  return (
    <div className="page-canvas min-h-full px-6 sm:px-10 py-10 pb-16 max-w-6xl mx-auto">
      <header className="mb-10 animate-fade-up">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full border backdrop-blur-sm"
            style={{
              borderColor: 'rgba(255, 46, 99, 0.25)',
              background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.1) 0%, rgba(0, 217, 255, 0.05) 100%)',
              color: 'var(--color-text-secondary)',
              boxShadow: '0 0 12px rgba(255, 46, 99, 0.08)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-glow-pulse"
              style={{ background: 'var(--color-brand)' }}
              aria-hidden
            />
            Simulate · Visualize · Connect
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] mb-4">
          <span
            style={{
              background: 'linear-gradient(135deg, #f0f4ff 0%, #00d9ff 40%, #b344ff 70%, #ff2e63 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Chemistry simulation tools
          </span>
        </h1>

        <p className="text-base sm:text-lg max-w-2xl leading-relaxed text-[var(--color-text-secondary)] font-medium">
          Six linked simulators for surface science, kinetics, orbitals, and thermodynamics — open any tool,
          then jump to a related one without losing your parameters.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {STATS.map((s, idx) => {
            const colors = [
              { accent: 'var(--color-accent-cyan)', glow: 'rgba(0, 217, 255, 0.2)' },
              { accent: 'var(--color-accent-pink)', glow: 'rgba(255, 46, 99, 0.2)' },
              { accent: 'var(--color-accent-green)', glow: 'rgba(0, 255, 136, 0.2)' },
              { accent: 'var(--color-accent-purple)', glow: 'rgba(179, 68, 255, 0.2)' },
            ];
            const color = colors[idx % colors.length];
            return (
              <div
                key={s.label}
                className="rounded-[16px] border px-4 py-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm"
                style={{
                  borderColor: color.glow,
                  background: `linear-gradient(135deg, ${color.glow} 0%, rgba(15, 20, 40, 0.5) 100%)`,
                  boxShadow: `0 0 16px ${color.glow}, inset 0 0 12px rgba(255, 255, 255, 0.02)`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-300"
                    style={{
                      background: `${color.accent}22`,
                      border: `1.5px solid ${color.accent}`,
                      boxShadow: `0 0 8px ${color.glow}`,
                    }}
                    aria-hidden
                  >
                    {s.icon}
                  </span>
                </div>
                <div className="text-2xl font-extrabold tabular-nums tracking-tight" style={{ color: color.accent }}>
                  {s.value}
                </div>
                <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </header>

      <section
        className="mb-10 rounded-[24px] border p-5 sm:p-6 animate-fade-up delay-100 backdrop-blur-sm"
        style={{
          borderColor: 'rgba(255, 46, 99, 0.2)',
          background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.6) 0%, rgba(26, 31, 58, 0.3) 100%)',
          boxShadow: '0 0 24px rgba(255, 46, 99, 0.08), 0 8px 32px rgba(0, 217, 255, 0.05)',
        }}
        aria-labelledby="spotlight-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <h2 id="spotlight-heading" className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
              Tool spotlight
            </h2>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              {activeTool.name}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
              Use the slider, quick picks below, or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono">→</kbd> to focus a card in the grid.
            </p>
          </div>
          <Link
            href={activeTool.href}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shrink-0 hover:scale-110 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand) 0%, #b344ff 100%)',
              boxShadow: '0 0 20px rgba(255, 46, 99, 0.4), 0 8px 24px rgba(255, 46, 99, 0.2)',
            }}
          >
            Open {activeTool.shortName}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {TOOLS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSpotlight(i)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-300 ${
                i === spotlight
                  ? 'text-white scale-105 -translate-y-0.5'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/40 hover:translate-y-[-2px]'
              }`}
              style={
                i === spotlight
                  ? {
                      borderColor: 'var(--color-brand)',
                      background: 'linear-gradient(135deg, var(--color-brand) 0%, #b344ff 100%)',
                      boxShadow: '0 0 12px rgba(255, 46, 99, 0.3), 0 4px 12px rgba(179, 68, 255, 0.2)',
                    }
                  : undefined
              }
            >
              <span aria-hidden>{t.icon}</span>
              {t.shortName}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
            <span>Focus</span>
            <span className="tabular-nums">
              {spotlight + 1} / {TOOLS.length}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={TOOLS.length - 1}
            step={1}
            value={spotlight}
            onChange={(e) => setSpotlight(Number(e.target.value))}
            className="w-full min-h-[44px] cursor-pointer"
            style={{ ['--slider-pct' as string]: `${pct}%` }}
            aria-valuemin={1}
            aria-valuemax={TOOLS.length}
            aria-valuenow={spotlight + 1}
            aria-label="Highlight a simulation tool in the grid below"
          />
          <div className="flex gap-1.5 pt-1" role="tablist" aria-label="Tool focus segments">
            {TOOLS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === spotlight}
                onClick={() => setSpotlight(i)}
                className={`flex-1 h-2.5 rounded-full transition-all min-h-[8px] ${
                  i === spotlight ? '' : 'hover:scale-110'
                }`}
                style={
                  i === spotlight
                    ? {
                        background: 'linear-gradient(90deg, var(--color-brand) 0%, #b344ff 100%)',
                        boxShadow: '0 0 12px rgba(255, 46, 99, 0.4), 0 0 24px rgba(179, 68, 255, 0.2)',
                      }
                    : {
                        background: 'linear-gradient(90deg, #3a4570 0%, #2a3555 100%)',
                        boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.2)',
                      }
                }
                title={t.shortName}
                aria-label={`Focus ${t.shortName}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {TOOLS.map((tool, i) => {
          const cfg = TOOL_CONFIG[tool.id];
          const isHot = spotlight === i;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group relative rounded-[20px] p-6 flex flex-col gap-3 border transition-all duration-300 animate-fade-up backdrop-blur-sm ${cfg.span ?? ''} ${
                isHot ? 'md:scale-[1.05] -translate-y-2' : 'hover:scale-[1.02] hover:-translate-y-1'
              }`}
              style={{
                borderColor: isHot ? cfg.accent : 'var(--color-border)',
                background: isHot
                  ? `linear-gradient(135deg, ${cfg.accent}18 0%, ${cfg.accent}08 100%)`
                  : 'linear-gradient(135deg, rgba(15, 20, 40, 0.5) 0%, rgba(26, 31, 58, 0.3) 100%)',
                boxShadow: isHot
                  ? `0 0 24px ${cfg.accent}40, 0 0 48px ${cfg.accent}20, 0 12px 48px rgba(0, 0, 0, 0.4)`
                  : '0 0 12px rgba(255, 46, 99, 0.05), 0 4px 16px rgba(0, 0, 0, 0.2)',
                animationDelay: `${80 + i * 50}ms`,
              }}
              onMouseEnter={() => setSpotlight(i)}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-xl shrink-0 border transition-all duration-300 group-hover:scale-110`}
                  style={{
                    borderColor: cfg.accent,
                    background: `${cfg.accent}18`,
                    boxShadow: `0 0 12px ${cfg.accent}30`,
                  }}
                >
                  {tool.icon}
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all duration-300"
                  style={{
                    color: '#fff',
                    background: `linear-gradient(135deg, ${cfg.accent} 0%, ${cfg.accent}cc 100%)`,
                    boxShadow: `0 0 12px ${cfg.accent}40`,
                  }}
                >
                  Open
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] leading-snug mb-2 group-hover:text-[var(--color-brand)] transition-colors">
                  {tool.name}
                </h2>
                <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)] line-clamp-3">
                  {tool.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-[8px]"
                    style={{
                      background: `${cfg.accent}15`,
                      color: cfg.accent,
                      border: `1px solid ${cfg.accent}30`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      <section className="animate-fade-up delay-400" aria-labelledby="bridges-heading">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <h2 id="bridges-heading" className="text-xs font-extrabold tracking-[0.2em] uppercase text-[var(--color-text-muted)] whitespace-nowrap">
            How tools connect
          </h2>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <p className="text-sm text-center mb-8 max-w-2xl mx-auto text-[var(--color-text-secondary)] leading-relaxed">
          Each bridge carries scientific context — FIM poles match Miller planes; reactor gases map to real-gas VdW data;
          orbitals explain ionization fields on tips.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {BRIDGE_PAIRS.map((conn) => {
            const fromMeta = TOOL_META[conn.from];
            const toMeta = TOOL_META[conn.to];
            const hasBidirectional = CONNECTIONS.find((c) => c.from === conn.to && c.to === conn.from);
            return (
              <div
                key={`${conn.from}-${conn.to}`}
                className="rounded-[16px] border p-5 pl-6 border-l-[4px] backdrop-blur-sm"
                style={{
                  borderColor: conn.accent,
                  borderLeftColor: conn.accent,
                  background: `linear-gradient(135deg, ${conn.accent}12 0%, ${conn.accent}06 100%)`,
                  boxShadow: `0 0 16px ${conn.accent}15, inset 0 0 16px rgba(0, 217, 255, 0.03)`,
                }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Link
                    href={fromMeta.href}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      borderColor: conn.accent,
                      color: '#fff',
                      background: `${conn.accent}22`,
                      boxShadow: `0 0 8px ${conn.accent}30`,
                    }}
                  >
                    <span aria-hidden>{fromMeta.icon}</span>
                    {fromMeta.label}
                  </Link>

                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ color: conn.accent }}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={hasBidirectional ? 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' : 'M17 8l4 4m0 0l-4 4m4-4H3'}
                    />
                  </svg>

                  <Link
                    href={toMeta.href}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-bg-tertiary)',
                      boxShadow: 'none',
                    }}
                  >
                    <span aria-hidden>{toMeta.icon}</span>
                    {toMeta.label}
                  </Link>
                </div>

                <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  {conn.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-[12px] text-[var(--color-text-muted)]">
          Scientific simulators for research and teaching — no login required.
        </p>
      </footer>
    </div>
  );
}
