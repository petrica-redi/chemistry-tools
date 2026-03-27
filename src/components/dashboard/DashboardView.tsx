'use client';

import Link from 'next/link';
import { TOOLS } from '@/types';
import { CONNECTIONS, TOOL_META } from '@/lib/connections';

const TOOL_CONFIG: Record<string, {
  accent: string;
  dotColor: string;
}> = {
  fim:       { accent: '#3b82f6', dotColor: 'bg-blue-500' },
  ctk:       { accent: '#10b981', dotColor: 'bg-emerald-500' },
  orbitals:  { accent: '#8b5cf6', dotColor: 'bg-violet-500' },
  titration: { accent: '#ec4899', dotColor: 'bg-pink-500' },
  miller:    { accent: '#f59e0b', dotColor: 'bg-amber-500' },
  vdw:       { accent: '#f97316', dotColor: 'bg-orange-500' },
};

const BRIDGE_PAIRS = CONNECTIONS.filter((c, i, arr) =>
  arr.findIndex((x) => x.from === c.to && x.to === c.from) > i ||
  !arr.find((x) => x.from === c.to && x.to === c.from)
).slice(0, 4);

const STATS: { label: string; value: string; sub: string }[] = [
  { label: 'Tools', value: '6', sub: 'simulators' },
  { label: 'Bridges', value: String(CONNECTIONS.length), sub: 'cross-links' },
  { label: 'Materials', value: '40+', sub: 'metals & gases' },
  { label: 'Scales', value: '3D–QM', sub: 'atom to reactor' },
];

export default function DashboardView() {

  return (
    <div className="page-canvas min-h-full px-6 sm:px-10 py-12 pb-20 max-w-7xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Hero Section                                                      */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <header className="mb-16 animate-fade-up">
        <div className="mb-6">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
            Advanced Simulation Suite
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
          Chemistry simulation tools
        </h1>

        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed mb-8">
          Six interconnected simulators for surface science, kinetics, atomic orbitals, and thermodynamics.
          Open any tool, explore related physics, and jump between them without losing your parameters.
        </p>

        {/* Stat Cards - Minimal Apple-style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-white/10 px-4 py-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]"
            >
              <div className="text-3xl font-bold text-white font-mono tracking-tight mb-1">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {s.label}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Tool Grid Section                                               */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="mb-20 animate-fade-up delay-100">
        <div className="mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            Explore Tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool, i) => {
            const cfg = TOOL_CONFIG[tool.id];
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative rounded-2xl border border-white/10 p-6 flex flex-col transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02] hover:shadow-lg hover:scale-[1.02] animate-fade-up"
                style={{
                  animationDelay: `${80 + i * 50}ms`,
                }}
              >
                {/* Accent dot */}
                <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full ${cfg.dotColor}`} />

                {/* Icon */}
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-3xl">{tool.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-100 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                    {tool.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-white/5">
                  {tool.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2 py-1 rounded-md"
                      style={{
                        background: `${cfg.accent}15`,
                        color: cfg.accent,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {tool.shortName}
                  </span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Connections Section                                             */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="animate-fade-up delay-200" aria-labelledby="bridges-heading">
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            Scientific Bridges
          </span>
          <h2 id="bridges-heading" className="text-2xl font-bold text-white mt-2">
            How tools connect
          </h2>
        </div>

        <p className="text-base text-gray-400 max-w-3xl mb-10 leading-relaxed">
          Each bridge carries scientific context. FIM poles match Miller planes; reactor gases map to real-gas VdW data;
          orbitals explain ionization fields on tips.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {BRIDGE_PAIRS.map((conn) => {
            const fromMeta = TOOL_META[conn.from];
            const toMeta = TOOL_META[conn.to];
            const hasBidirectional = CONNECTIONS.find((c) => c.from === conn.to && c.to === conn.from);
            return (
              <div
                key={`${conn.from}-${conn.to}`}
                className="rounded-xl border border-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]"
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: conn.accent,
                }}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Link
                    href={fromMeta.href}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-300 hover:scale-105"
                    style={{
                      borderColor: conn.accent,
                      color: conn.accent,
                      background: `${conn.accent}10`,
                    }}
                  >
                    <span>{fromMeta.icon}</span>
                    {fromMeta.label}
                  </Link>

                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    style={{ color: conn.accent }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={hasBidirectional ? 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' : 'M17 8l4 4m0 0l-4 4m4-4H3'}
                    />
                  </svg>

                  <Link
                    href={toMeta.href}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20"
                  >
                    <span>{toMeta.icon}</span>
                    {toMeta.label}
                  </Link>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {conn.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Footer                                                          */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <footer className="mt-20 pt-10 border-t border-white/10 text-center animate-fade-up delay-300">
        <p className="text-sm text-gray-500">
          Advanced simulators for research and teaching · No login required
        </p>
      </footer>
    </div>
  );
}
