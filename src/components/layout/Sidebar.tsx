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
      className="w-[240px] min-w-[240px] h-screen flex flex-col overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.04), 0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Logo Area with Premium Styling */}
      <Link
        href="/"
        className="group px-4 pt-6 pb-5 block transition-all duration-300"
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
        aria-current={isHome ? 'page' : undefined}
      >
        <div className="flex items-center gap-3">
          {/* Animated Gradient Logo Container */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 text-white font-semibold relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-purple) 50%, var(--color-accent-pink) 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 8s ease infinite',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          >
            ⚗️
            <style>{`
              @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
          </div>

          {/* Logo Text */}
          <div className="min-w-0">
            <span className="text-[13px] font-700 text-white block leading-tight">
              Chemistry Tools
            </span>
            <p className="text-[10px] font-400 text-[var(--color-text-muted)] mt-1 opacity-75 group-hover:opacity-100 transition-opacity duration-300">
              Simulation Suite
            </p>
          </div>
        </div>
      </Link>

      {/* Section Divider */}
      <div
        className="mx-3.5 my-3 h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      {/* Section Label */}
      <div className="px-4 pb-2.5">
        <p className="text-[9px] font-700 tracking-[0.08em] uppercase text-[var(--color-text-muted)] opacity-70">
          Tools
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 flex flex-col gap-1 pb-4">
        {TOOLS.map((tool) => {
          const isActive = pathname === tool.href;
          const accentColor = TOOL_COLORS[tool.id] || 'var(--color-brand)';

          return (
            <Link
              key={tool.id}
              href={tool.href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'group flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-250 relative',
                isActive
                  ? 'text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-white',
              ].join(' ')}
              style={
                isActive
                  ? {
                      background: `${accentColor}18`,
                      borderLeft: `3px solid ${accentColor}`,
                      paddingLeft: 'calc(12px - 3px)',
                      boxShadow: `inset 0 1px 3px rgba(255, 255, 255, 0.08), 0 0 16px ${accentColor}10`,
                    }
                  : {
                      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {/* Left Accent Bar (Active Only) */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-300"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 12px ${accentColor}80`,
                  }}
                />
              )}

              {/* Icon Container */}
              <span
                className="text-base w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-all duration-250 flex-center relative"
                style={{
                  background: isActive
                    ? `${accentColor}20`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1.5px solid ${
                    isActive
                      ? `${accentColor}40`
                      : 'rgba(255, 255, 255, 0.08)'
                  }`,
                  boxShadow: isActive
                    ? `0 0 12px ${accentColor}30, inset 0 1px 2px rgba(255, 255, 255, 0.1)`
                    : 'inset 0 1px 2px rgba(255, 255, 255, 0.04)',
                  color: isActive ? accentColor : 'inherit',
                  filter: isActive ? 'brightness(1.2)' : 'brightness(0.95)',
                }}
              >
                {tool.icon}
              </span>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-600 truncate leading-tight">
                  {tool.shortName}
                </div>
                <div className="text-[9px] truncate mt-0.5 text-[var(--color-text-muted)] opacity-70 group-hover:opacity-90 transition-opacity duration-250">
                  {tool.tags[0]}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Section Divider */}
      <div
        className="mx-3.5 mb-3 h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      {/* Premium Info Box */}
      <div
        className="mx-2.5 mb-4 rounded-[10px] px-4 py-3 text-center border transition-all duration-300 hover:border-opacity-100 cursor-default"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.06), 0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        <p className="text-[9px] font-500 text-[var(--color-text-muted)] leading-relaxed opacity-80">
          Built with<br />
          <span className="opacity-70">Three.js • Chart.js • Plotly</span>
        </p>
      </div>
    </aside>
  );
}
