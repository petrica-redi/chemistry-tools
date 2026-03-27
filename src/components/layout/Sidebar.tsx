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
  const isHome = pathname === '/';

  return (
    <aside
      className="w-[260px] min-w-[260px] h-screen flex flex-col overflow-y-auto border-r"
      style={{
        background: 'linear-gradient(180deg, #0f1428 0%, #1a0f2e 100%)',
        borderColor: 'var(--color-border)',
        boxShadow: '4px 0 32px rgba(255, 46, 99, 0.08), 4px 0 64px rgba(0, 217, 255, 0.04)',
      }}
    >
      <Link
        href="/"
        className={`group px-5 pt-7 pb-6 block border-b rounded-br-2xl transition-all ${
          isHome ? '' : 'hover:bg-[var(--color-bg-tertiary)]/40'
        }`}
        style={{
          borderColor: 'var(--color-border)',
          background: isHome ? 'linear-gradient(135deg, rgba(255, 46, 99, 0.08) 0%, rgba(0, 217, 255, 0.05) 100%)' : 'transparent',
        }}
        aria-current={isHome ? 'page' : undefined}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 text-white font-bold ring-offset-2 transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #ff2e63 0%, #b344ff 100%)',
              boxShadow: isHome
                ? '0 0 16px rgba(255, 46, 99, 0.5), 0 4px 14px rgba(179, 68, 255, 0.3)'
                : '0 0 12px rgba(255, 46, 99, 0.3), 0 4px 14px rgba(179, 68, 255, 0.15)',
            }}
          >
            ⚗
          </div>
          <div>
            <span className="text-[15px] font-extrabold tracking-tight text-[var(--color-text-primary)] block leading-tight">
              Chemistry Tools
            </span>
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--color-text-muted)] mt-0.5">
              Simulation platform
            </p>
          </div>
        </div>
      </Link>

      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-text-muted)] px-2">
          Simulators
        </p>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1 pb-4">
        {TOOLS.map((tool) => {
          const isActive = pathname === tool.href;
          const accentColor = TOOL_COLORS[tool.id] || 'var(--color-brand)';

          return (
            <Link
              key={tool.id}
              href={tool.href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-[16px] transition-all duration-300',
                isActive
                  ? 'text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/40 hover:translate-x-1',
              ].join(' ')}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}08 100%)`,
                      boxShadow: `0 0 16px ${accentColor}22, 0 4px 16px ${accentColor}18`,
                      borderLeft: `3px solid ${accentColor}`,
                      paddingLeft: 'calc(12px - 3px)',
                    }
                  : undefined
              }
            >

              <span
                className="text-lg w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                style={{
                  background: isActive ? `${accentColor}22` : 'var(--color-bg-tertiary)',
                  border: isActive ? `1.5px solid ${accentColor}` : '1px solid var(--color-border)',
                  boxShadow: isActive ? `0 0 8px ${accentColor}30` : 'none',
                }}
              >
                {tool.icon}
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate leading-tight">
                  {tool.shortName}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-slate-400' : ''}`} style={!isActive ? { color: 'var(--color-text-muted)' } : undefined}>
                  {tool.tags.slice(0, 2).join(' · ')}
                </div>
              </div>

              <svg
                className={`w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </nav>

      <div
        className="mx-4 mb-5 rounded-[16px] px-4 py-3 text-center border backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.1) 0%, rgba(0, 217, 255, 0.05) 100%)',
          borderColor: 'rgba(255, 46, 99, 0.25)',
          boxShadow: '0 0 16px rgba(255, 46, 99, 0.08), inset 0 0 16px rgba(0, 217, 255, 0.05)',
        }}
      >
        <p className="text-[11px] font-medium text-[var(--color-text-secondary)] leading-snug">
          Research &amp; teaching — tools link together via shared parameters.
        </p>
      </div>
    </aside>
  );
}
