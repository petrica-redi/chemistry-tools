import Link from 'next/link';
import { TOOLS } from '@/types';

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
          Six scientific simulators for surface science, catalysis, quantum chemistry,
          and thermodynamics — built for research and teaching.
        </p>

        {/* Quick stats row */}
        <div className="flex gap-6 mt-6">
          {[
            { label: 'Tools', value: '6' },
            { label: 'Materials DB', value: '40+' },
            { label: 'Rendering', value: 'Three.js' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                className="text-xl font-bold font-mono"
                style={{ color: 'var(--color-accent-blue)' }}
              >
                {value}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bento Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
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
              {/* Radial glow inside card */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${cfg.glow} 0%, transparent 65%)`,
                }}
              />

              {/* Icon + arrow row */}
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

              {/* Text */}
              <div className="relative">
                <h2
                  className="text-[15px] font-bold leading-snug mb-1.5 transition-colors duration-200"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {tool.name}
                </h2>
                <p
                  className="text-[12px] leading-relaxed line-clamp-3"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {tool.description}
                </p>
              </div>

              {/* Tags */}
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
    </div>
  );
}
