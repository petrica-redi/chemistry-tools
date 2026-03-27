'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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

export default function DashboardView() {
  const [spotlight, setSpotlight] = useState(0);

  const pct = useMemo(() => (TOOLS.length <= 1 ? 0 : (spotlight / (TOOLS.length - 1)) * 100), [spotlight]);

  const activeTool = TOOLS[spotlight];

  return (
    <div className="min-h-full px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      {/* Hero */}
      <header className="mb-10 animate-fade-up">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-pulse" aria-hidden />
            Simulate · Visualize · Connect
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.1] mb-4">
          Chemistry{' '}
          <span className="text-[var(--color-brand)]">simulation</span>
          <br className="sm:hidden" />
          {' '}tools
        </h1>

        <p className="text-base sm:text-lg max-w-2xl leading-relaxed text-[var(--color-text-secondary)] font-medium">
          Six linked simulators for surface science, kinetics, orbitals, and thermodynamics — open any tool,
          then jump to a related one without losing your parameters.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {[
            { label: 'Tools', value: '6', sub: 'simulators' },
            { label: 'Bridges', value: String(CONNECTIONS.length), sub: 'cross-links' },
            { label: 'Materials', value: '40+', sub: 'metals & gases' },
            { label: 'Scales', value: '3D–QM', sub: 'atom to reactor' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-[var(--color-brand-muted)] flex items-center justify-center text-[var(--color-brand)] text-sm font-bold">
                  ◆
                </span>
              </div>
              <div className="text-2xl font-extrabold text-[var(--color-text-primary)] tabular-nums">{s.value}</div>
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{s.label}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Spotlight control */}
      <section
        className="mb-10 rounded-3xl border bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] animate-fade-up delay-100"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
              Tool spotlight
            </h2>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              {activeTool.name}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
              Drag the slider to focus a simulator — the card grid highlights your selection.
            </p>
          </div>
          <Link
            href={activeTool.href}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 shrink-0"
            style={{ background: 'var(--color-brand)' }}
          >
            Open {activeTool.shortName}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
            <span>Scroll focus</span>
            <span>
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
            className="w-full"
            style={{ ['--slider-pct' as string]: `${pct}%` }}
            aria-label="Highlight a simulation tool"
          />
          <div className="flex gap-1 pt-1">
            {TOOLS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSpotlight(i)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i === spotlight ? 'bg-[var(--color-brand)]' : 'bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Focus ${t.shortName}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {TOOLS.map((tool, i) => {
          const cfg = TOOL_CONFIG[tool.id];
          const isHot = spotlight === i;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group relative rounded-3xl p-6 flex flex-col gap-3 border bg-white transition-all duration-300 animate-fade-up ${cfg.span ?? ''} ${
                isHot ? 'shadow-lg scale-[1.02]' : 'shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{
                borderColor: isHot ? cfg.accent : 'var(--color-border)',
                boxShadow: isHot ? `0 0 0 3px color-mix(in srgb, ${cfg.accent} 25%, transparent), 0 12px 40px rgba(15, 23, 42, 0.08)` : undefined,
                animationDelay: `${80 + i * 50}ms`,
              }}
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

      {/* Connections */}
      <section className="animate-fade-up delay-400">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs font-extrabold tracking-[0.2em] uppercase text-[var(--color-text-muted)] whitespace-nowrap">
            How tools connect
          </span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <p className="text-sm text-center mb-8 max-w-2xl mx-auto text-[var(--color-text-secondary)]">
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
                className="rounded-3xl border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Link
                    href={fromMeta.href}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border bg-slate-50 hover:bg-slate-100 transition-colors"
                    style={{ borderColor: 'var(--color-border)', color: conn.accent }}
                  >
                    <span>{fromMeta.icon}</span>
                    {fromMeta.label}
                  </Link>

                  <svg
                    className="w-4 h-4 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={hasBidirectional ? 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' : 'M17 8l4 4m0 0l-4 4m4-4H3'}
                    />
                  </svg>

                  <Link
                    href={toMeta.href}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>{toMeta.icon}</span>
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
    </div>
  );
}
