'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS } from '@/types';

const TOOL_COLORS: Record<string, string> = {
  fim:      'var(--color-accent-blue)',
  ctk:      'var(--color-accent-green)',
  orbitals: 'var(--color-accent-purple)',
  titration:'var(--color-accent-pink)',
  miller:   'var(--color-accent-yellow)',
  vdw:      'var(--color-accent-orange)',
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-[240px] min-w-[240px] h-screen flex flex-col overflow-y-auto"
      style={{
        background: 'rgba(6, 10, 20, 0.85)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="group px-5 pt-6 pb-5 block">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))',
              boxShadow: '0 0 16px rgba(79,142,247,0.4)',
            }}
          >
            ⚗
          </div>
          <span
            className="text-[13px] font-bold tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #fff 0%, var(--color-text-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Chemistry Tools
          </span>
        </div>
        <p className="text-[10px] font-mono tracking-widest uppercase ml-10" style={{ color: 'var(--color-text-muted)' }}>
          Simulation Platform
        </p>
      </Link>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Nav label */}
      <div className="px-5 pb-1.5 text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
        Tools
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {TOOLS.map((tool) => {
          const isActive = pathname === tool.href;
          const accentColor = TOOL_COLORS[tool.id] || 'var(--color-accent-blue)';

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                />
              )}

              {/* Icon badge */}
              <span
                className="text-base w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm transition-all"
                style={{
                  background: isActive ? `color-mix(in srgb, ${accentColor} 15%, transparent)` : 'rgba(255,255,255,0.04)',
                  border: isActive ? `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)` : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {tool.icon}
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold truncate leading-tight">
                  {tool.shortName}
                </div>
                <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {tool.tags[0]}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="mx-4 mt-2 mb-4 rounded-xl px-3 py-2.5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="text-[9px] font-mono text-center" style={{ color: 'var(--color-text-muted)' }}>
          Built for research &amp; teaching
        </div>
      </div>
    </aside>
  );
}
