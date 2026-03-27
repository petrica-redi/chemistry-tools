import Link from 'next/link';
import { TOOLS } from '@/types';
import { CONNECTIONS, TOOL_META } from '@/lib/connections';

const TOOL_CONFIG: Record<string, {
  accent: string;
  glow: string;
  borderGlow: string;
  bg: string;
  span?: string;
}> = {
  fim:       { accent: '#4f8ef7', glow: 'rgba(79,142,247,0.2)',   borderGlow: 'rgba(79,142,247,0.35)',  bg: 'rgba(79,142,247,0.05)',  span: 'col-span-2' },
  ctk:       { accent: '#2dd4a0', glow: 'rgba(45,212,160,0.2)',   borderGlow: 'rgba(45,212,160,0.35)',  bg: 'rgba(45,212,160,0.05)' },
  orbitals:  { accent: '#9d79f5', glow: 'rgba(157,121,245,0.2)',  borderGlow: 'rgba(157,121,245,0.35)', bg: 'rgba(157,121,245,0.05)', span: 'col-span-2' },
  titration: { accent: '#e879c4', glow: 'rgba(232,121,196,0.2)',  borderGlow: 'rgba(232,121,196,0.35)', bg: 'rgba(232,121,196,0.05)' },
  miller:    { accent: '#f5c842', glow: 'rgba(245,200,66,0.2)',   borderGlow: 'rgba(245,200,66,0.35)',  bg: 'rgba(245,200,66,0.05)' },
  vdw:       { accent: '#f97340', glow: 'rgba(249,115,64,0.2)',   borderGlow: 'rgba(249,115,64,0.35)',  bg: 'rgba(249,115,64,0.05)' },
};

/** Deduplicated unique connection pairs for the bridge grid */
const BRIDGE_PAIRS = CONNECTIONS.filter((c, i, arr) =>
  arr.findIndex((x) => x.from === c.to && x.to === c.from) > i ||
  !arr.find((x) => x.from === c.to && x.to === c.from)
).slice(0, 4);

export default function Home() {
  return (
    <div className="min-h-full px-8 py-10 max-w-5xl mx-auto">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="mb-12 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full tracking-widest uppercase"
            style={{
              background: 'rgba(79,142,247,0.12)',
              border: '1px solid rgba(79,142,247,0.25)',
              color: '#4f8ef7',
            }}
          >
            Interactive Platform
          </span>
        </div>

        <h1
          className="text-5xl font-bold tracking-tight leading-tight mb-4"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #8899bb 60%, #4f8ef7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Chemistry<br />Simulation Tools
        </h1>

        <p className="text-base max-w-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Six interconnected simulators for surface science, catalysis, quantum chemistry,
          and thermodynamics — each one illuminates the others.
        </p>

        <div className="flex gap-6 mt-6">
          {[
            { label: 'Tools', value: '6' },
            { label: 'Bridges', value: String(CONNECTIONS.length) },
            { label: 'Materials', value: '40+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xl font-bold font-mono" style={{ color: 'var(--color-accent-blue)' }}>{value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bento Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {TOOLS.map((tool, i) => {
          const cfg = TOOL_CONFIG[tool.id];
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-all duration-300 animate-fade-up ${cfg.span ?? ''}`}
              style={{
                background: cfg.bg,
                border: `1px solid rgba(255,255,255,0.07)`,
                animationDelay: `${i * 70}ms`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = `1px solid ${cfg.borderGlow}`;
                el.style.boxShadow = `0 8px 40px ${cfg.glow}, inset 0 0 40px rgba(255,255,255,0.01)`;
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = `1px solid rgba(255,255,255,0.07)`;
                el.style.boxShadow = 'none';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 30% 30%, ${cfg.glow} 0%, transparent 65%)` }}
              />

              <div className="flex items-start justify-between relative">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${cfg.accent} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${cfg.accent} 25%, transparent)`,
                    boxShadow: `0 0 16px color-mix(in srgb, ${cfg.accent} 20%, transparent)`,
                  }}
                >
                  {tool.icon}
                </span>

                <svg
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: cfg.accent }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                </svg>
              </div>

              <div className="relative">
                <h2 className="text-[15px] font-bold leading-snug mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  {tool.name}
                </h2>
                <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {tool.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto relative">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                    style={{
                      background: `color-mix(in srgb, ${cfg.accent} 10%, rgba(255,255,255,0.03))`,
                      border: `1px solid color-mix(in srgb, ${cfg.accent} 20%, rgba(255,255,255,0.05))`,
                      color: `color-mix(in srgb, ${cfg.accent} 80%, var(--color-text-secondary))`,
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

      {/* ── Connections section ──────────────────────────────────── */}
      <div className="animate-fade-up delay-400">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
              How the tools connect
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <p className="text-[13px] text-center mb-6 max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Each tool answers a different scale of the same question. Deep links carry
          your current parameters between them so the context is never lost.
        </p>

        {/* Bridge cards */}
        <div className="grid grid-cols-2 gap-3">
          {BRIDGE_PAIRS.map((conn) => {
            const fromMeta = TOOL_META[conn.from];
            const toMeta = TOOL_META[conn.to];
            const hasBidirectional = CONNECTIONS.find((c) => c.from === conn.to && c.to === conn.from);
            return (
              <div
                key={`${conn.from}-${conn.to}`}
                className="rounded-2xl p-4"
                style={{
                  background: `color-mix(in srgb, ${conn.accent} 5%, rgba(255,255,255,0.02))`,
                  border: `1px solid color-mix(in srgb, ${conn.accent} 15%, rgba(255,255,255,0.06))`,
                }}
              >
                {/* Tool pair */}
                <div className="flex items-center gap-2 mb-3">
                  <Link
                    href={fromMeta.href}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:opacity-80"
                    style={{
                      background: `color-mix(in srgb, ${conn.accent} 12%, rgba(255,255,255,0.03))`,
                      border: `1px solid color-mix(in srgb, ${conn.accent} 20%, rgba(255,255,255,0.06))`,
                    }}
                  >
                    <span className="text-sm">{fromMeta.icon}</span>
                    <span className="text-[11px] font-semibold" style={{ color: conn.accent }}>{fromMeta.label}</span>
                  </Link>

                  <svg
                    className="w-4 h-4 shrink-0"
                    style={{ color: conn.accent, opacity: 0.6 }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d={hasBidirectional ? 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' : 'M17 8l4 4m0 0l-4 4m4-4H3'} />
                  </svg>

                  <Link
                    href={toMeta.href}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:opacity-80"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-sm">{toMeta.icon}</span>
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{toMeta.label}</span>
                  </Link>
                </div>

                {/* Description */}
                <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {conn.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
