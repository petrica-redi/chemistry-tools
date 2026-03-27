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
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" aria-hidden />
            Simulate · Visualize · Connect
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.08] mb-4">
          Chemistry{' '}
          <span className="text-[var(--color-brand)]">simulation</span>
          <br className="sm:hidden" />
          {' '}tools
        </h1>

        <p className="text-base sm:text-lg max-w-2xl leading-relaxed text-[var(--color-text-secondary)] font-medium">
          Six linked simulators for surface science, kinetics, orbitals, and thermodynamics — open any tool,
          then jump to a related one without losing your parameters.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-md"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
                  aria-hidden
                >
                  {s.icon}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-[var(--color-text-primary)] tabular-nums tracking-tight">
                {s.value}
              </div>
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                {s.label}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </header>

      <section
        className="mb-10 rounded-3xl border bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] animate-fade-up delay-100"
        style={{ borderColor: 'var(--color-border)' }}
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
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-105 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 shrink-0"
            style={{ background: 'var(--color-brand)' }}
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
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                i === spotlight
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] text-[var(--color-brand)] shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:border-slate-300'
              }`}
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
                className={`flex-1 h-2 rounded-full transition-all min-h-[8px] ${
                  i === spotlight ? 'bg-[var(--color-brand)]' : 'bg-slate-200 hover:bg-slate-300'
                }`}
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
              className={`group relative rounded-3xl p-6 flex flex-col gap-3 border bg-white transition-all duration-300 animate-fade-up ${cfg.span ?? ''} ${
                isHot ? 'shadow-lg md:scale-[1.02]' : 'shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{
                borderColor: isHot ? cfg.accent : 'var(--color-border)',
                boxShadow: isHot ? `0 0 0 3px color-mix(in srgb, ${cfg.accent} 22%, transparent), 0 12px 40px rgba(15, 23, 42, 0.08)` : undefined,
                animationDelay: `${80 + i * 50}ms`,
              }}
              onMouseEnter={() => setSpotlight(i)}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${cfg.iconBg}`}
                  style={{ borderColor: `${cfg.accent}22` }}
                >
                  {tool.icon}
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                  style={{ color: cfg.accent, background: `${cfg.accent}12` }}
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
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80"
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
                className="rounded-3xl border bg-white p-5 pl-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border-l-[4px]"
                style={{ borderColor: 'var(--color-border)', borderLeftColor: conn.accent }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Link
                    href={fromMeta.href}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
                    style={{ borderColor: 'var(--color-border)', color: conn.accent }}
                  >
                    <span aria-hidden>{fromMeta.icon}</span>
                    {fromMeta.label}
                  </Link>

                  <svg
                    className="w-4 h-4 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
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
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
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

      <footer className="mt-16 pt-8 border-t border-[var(--color-border)] text-center">
        <p className="text-[12px] text-[var(--color-text-muted)]">
          Scientific simulators for research and teaching — no login required.
        </p>
      </footer>
    </div>
  );
}
