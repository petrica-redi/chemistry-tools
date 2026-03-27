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

const FEATURES = [
  { icon: '🎯', title: 'Real-time 3D Visualization', desc: 'Interactive WebGL rendering' },
  { icon: '⚛️', title: '67 Chemical Species', desc: 'Comprehensive library' },
  { icon: '📊', title: 'Interactive Phase Diagrams', desc: 'Dynamic equilibrium plots' },
  { icon: '🔬', title: 'Quantum Mechanics', desc: 'Ab initio accuracy' },
];

export default function DashboardView() {
  return (
    <div className="page-canvas min-h-full relative overflow-hidden bg-slate-950">
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Animated Gradient Orb Background                                */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96"
          style={{
            background: `
              radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
            `,
            animation: 'float 20s ease-in-out infinite',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80"
          style={{
            background: `
              radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 60% 60%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
            `,
            animation: 'float 25s ease-in-out infinite reverse',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-1/2 right-0 w-screen h-screen"
          style={{
            background: `
              radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)
            `,
            animation: 'pulse-slow 6s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Main content container */}
      <div className="relative z-10 px-6 sm:px-10 py-12 pb-20 max-w-7xl mx-auto">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* Hero Section with Animated Stats                               */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <header className="mb-24 animate-fade-up">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-300 whitespace-nowrap">
              Advanced Simulation Suite
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          </div>

          {/* Main Title with Gradient */}
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, #3b82f6 0%, #06b6d4 35%, #8b5cf6 100%)`,
              animation: 'gradient-shift 8s ease-in-out infinite',
            }}
          >
            Chemistry Simulation Suite
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl sm:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-14 font-light tracking-wide"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Six interconnected simulators for surface science, kinetics, atomic orbitals, and thermodynamics.
            Open any tool, explore related physics, and jump between them without losing your parameters.
          </p>

          {/* Animated Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {STATS.map((s, idx) => (
              <div
                key={s.label}
                className="relative group rounded-2xl border border-white/10 px-6 py-6 backdrop-blur-xl bg-white/[0.03] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05]"
                style={{
                  animation: `slide-up 0.6s ease-out ${0.1 + idx * 0.1}s both`,
                }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent)',
                }} />

                <div className="relative">
                  <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 font-mono tracking-tight mb-2">
                    {s.value}
                  </div>
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                    {s.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-medium">
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {FEATURES.map((feat, idx) => (
              <div
                key={feat.title}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300"
                style={{
                  animation: `fade-in-slide 0.5s ease-out ${0.3 + idx * 0.08}s both`,
                }}
              >
                <span className="text-lg">{feat.icon}</span>
                <span className="text-xs font-semibold text-gray-200">{feat.title}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* Tool Grid Section - Premium Cards with Gradient Borders       */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="mb-28 animate-fade-up delay-100">
          <div className="mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
              Explore Tools
            </span>
            <h2 className="text-4xl font-black text-white mt-3">Powerful Simulators</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool, i) => {
              const cfg = TOOL_CONFIG[tool.id];
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative rounded-3xl border border-white/8 p-8 flex flex-col transition-all duration-500 hover:border-white/15 overflow-hidden"
                  style={{
                    animation: `scale-in-fade ${0.6}s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.1 + i * 0.08}s both`,
                  }}
                >
                  {/* Gradient Border Top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
                    }}
                  />

                  {/* Background glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl"
                    style={{
                      background: cfg.accent,
                    }}
                  />

                  {/* Card lift and glow effect */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at top right, ${cfg.accent}25, transparent)`,
                      boxShadow: `0 0 60px ${cfg.accent}30`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl" style={{
                      background: `${cfg.accent}15`,
                      transition: 'all 0.5s',
                    }}>
                      <span className="text-3xl group-hover:scale-125 transition-transform duration-500">
                        {tool.icon}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-white mb-3 transition-all duration-300">
                      {tool.name}
                    </h3>

                    <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3 group-hover:text-gray-300 transition-colors">
                      {tool.description}
                    </p>

                    {/* Tags with gradient background */}
                    <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/5">
                      {tool.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all duration-300"
                          style={{
                            background: `${cfg.accent}20`,
                            color: cfg.accent,
                            borderLeft: `2px solid ${cfg.accent}`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        {tool.shortName}
                      </span>
                      <span className="text-2xl text-gray-600 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* Elegant Flow Diagram - Connections Section                     */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="mb-28 animate-fade-up delay-200" aria-labelledby="bridges-heading">
          <div className="mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
              Scientific Bridges
            </span>
            <h2 id="bridges-heading" className="text-4xl font-black text-white mt-3">
              How Tools Connect
            </h2>
          </div>

          <p className="text-base text-gray-400 max-w-4xl mb-12 leading-relaxed font-light">
            Each bridge carries scientific context. FIM poles match Miller planes; reactor gases map to real-gas VdW data;
            orbitals explain ionization fields on tips.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {BRIDGE_PAIRS.map((conn, idx) => {
              const fromMeta = TOOL_META[conn.from];
              const toMeta = TOOL_META[conn.to];
              const hasBidirectional = CONNECTIONS.find((c) => c.from === conn.to && c.to === conn.from);
              return (
                <div
                  key={`${conn.from}-${conn.to}`}
                  className="group relative rounded-2xl border border-white/10 p-7 backdrop-blur-xl bg-white/[0.02] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] overflow-hidden"
                  style={{
                    animation: `fade-in-up 0.6s ease-out ${0.4 + idx * 0.1}s both`,
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(180deg, ${conn.accent}, transparent)`,
                    }}
                  />

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{
                      background: conn.accent,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Link
                        href={fromMeta.href}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        style={{
                          borderColor: conn.accent,
                          color: conn.accent,
                          background: `${conn.accent}15`,
                        }}
                      >
                        <span>{fromMeta.icon}</span>
                        {fromMeta.label}
                      </Link>

                      <svg
                        className="w-6 h-6 shrink-0 text-gray-500 group-hover:text-gray-400 transition-colors"
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-white/15 text-gray-300 transition-all duration-300 hover:scale-110 hover:border-white/30 hover:shadow-lg"
                      >
                        <span>{toMeta.icon}</span>
                        {toMeta.label}
                      </Link>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {conn.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* Premium Footer                                                  */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <footer className="mt-20 pt-16 border-t border-white/5 text-center animate-fade-up delay-300">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-gray-300">Built for research & education</span>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Advanced simulators for research and teaching · No login required · <span className="text-gray-600">Open source</span>
          </p>
        </footer>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-20px, -30px);
          }
          50% {
            transform: translate(10px, -50px);
          }
          75% {
            transform: translate(-30px, -10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            backgroundImage: linear-gradient(135deg, #3b82f6 0%, #06b6d4 35%, #8b5cf6 100%);
          }
          50% {
            backgroundImage: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 35%, #3b82f6 100%);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-slide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in-fade {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-in-up 0.8s ease-out both;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}
