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
      className="w-[240px] min-w-[240px] h-screen flex flex-col overflow-y-auto border-r"
      style={{
        background: 'var(--color-bg-primary)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="px-4 pt-6 pb-5 block border-b transition-colors duration-150"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
        aria-current={isHome ? 'page' : undefined}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 text-white"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-pink) 100%)',
            }}
          >
            ⚗
          </div>
          <div className="min-w-0">
            <span className="text-[13px] font-600 text-[var(--color-text-primary)] block leading-tight">
              Chemistry Tools
            </span>
            <p className="text-[11px] font-400 text-[var(--color-text-muted)] mt-0.5">
              Simulation
            </p>
          </div>
        </div>
      </Link>

      {/* Section label */}
      <div className="px-3.5 pt-4 pb-2.5">
        <p className="text-[10px] font-600 tracking-[0.05em] uppercase text-[var(--color-text-muted)]">
          Tools
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 flex flex-col gap-0.5 pb-4">
        {TOOLS.map((tool) => {
          const isActive = pathname === tool.href;
          const accentColor = TOOL_COLORS[tool.id] || 'var(--color-brand)';

          return (
            <Link
              key={tool.id}
              href={tool.href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'group flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-all duration-150',
                isActive
                  ? 'text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/40',
              ].join(' ')}
              style={
                isActive
                  ? {
                      background: `${accentColor}08`,
                      borderLeft: `2px solid ${accentColor}`,
                      paddingLeft: 'calc(10px - 2px)',
                    }
                  : undefined
              }
            >
              {/* Icon */}
              <span
                className="text-base w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: isActive ? `${accentColor}12` : 'var(--color-bg-tertiary)',
                  border: `1px solid ${isActive ? accentColor : 'rgba(255, 255, 255, 0.06)'}`,
                }}
              >
                {tool.icon}
              </span>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-500 truncate leading-tight">
                  {tool.shortName}
                </div>
                <div className="text-[10px] truncate mt-0.5 text-[var(--color-text-muted)]">
                  {tool.tags[0]}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Info box */}
      <div
        className="mx-2.5 mb-4 rounded-[8px] px-3 py-2.5 text-center border"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <p className="text-[10px] font-400 text-[var(--color-text-muted)] leading-snug">
          Tools link via shared parameters
        </p>
      </div>
    </aside>
  );
}
