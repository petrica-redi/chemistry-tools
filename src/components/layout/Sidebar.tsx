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
      className="w-[260px] min-w-[260px] h-screen flex flex-col overflow-y-auto border-r bg-white shadow-[4px_0_24px_rgba(15,23,42,0.04)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <Link
        href="/"
        className={`group px-5 pt-7 pb-6 block border-b transition-colors rounded-br-2xl ${
          isHome ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-slate-50/80'
        }`}
        style={{ borderColor: 'var(--color-border)' }}
        aria-current={isHome ? 'page' : undefined}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 text-white font-bold ring-offset-2 transition-shadow"
            style={{
              background: 'linear-gradient(145deg, #b91c1c 0%, #7f1d1d 100%)',
              boxShadow: isHome
                ? '0 4px 14px rgba(185, 28, 28, 0.45), 0 0 0 2px rgba(185, 28, 28, 0.25)'
                : '0 4px 14px rgba(185, 28, 28, 0.35)',
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
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200',
                isActive
                  ? 'text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]',
              ].join(' ')}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.2)',
                    }
                  : undefined
              }
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full"
                  style={{ background: accentColor }}
                />
              )}

              <span
                className="text-lg w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'var(--color-bg-tertiary)',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--color-border)',
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
        className="mx-4 mb-5 rounded-2xl px-4 py-3 text-center border"
        style={{
          background: 'var(--color-brand-muted)',
          borderColor: 'rgba(185, 28, 28, 0.15)',
        }}
      >
        <p className="text-[11px] font-medium text-[var(--color-text-secondary)] leading-snug">
          Research &amp; teaching — tools link together via shared parameters.
        </p>
      </div>
    </aside>
  );
}
