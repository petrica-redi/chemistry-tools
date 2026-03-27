'use client';

import { ReactNode, useState } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  accent?: string;
}

export default function Panel({
  title,
  children,
  className = '',
  collapsible = false,
  defaultOpen = true,
  accent,
}: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-[16px] overflow-hidden ${className} backdrop-blur-sm`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.5) 0%, rgba(26, 31, 58, 0.3) 100%)',
        border: '1px solid rgba(0, 217, 255, 0.15)',
        boxShadow: '0 0 12px rgba(255, 46, 99, 0.05), inset 0 0 16px rgba(0, 217, 255, 0.02)',
      }}
    >
      {title && (
        <button
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-all duration-300 hover:bg-[var(--color-bg-tertiary)]/20"
          style={{ cursor: collapsible ? 'pointer' : 'default' }}
          onClick={() => collapsible && setOpen((v) => !v)}
          type="button"
        >
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-2"
            style={{ color: accent ?? 'var(--color-text-muted)' }}
          >
            {accent && (
              <span
                className="w-1.5 h-1.5 rounded-full inline-block animate-glow-pulse"
                style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
              />
            )}
            {title}
          </span>
          {collapsible && (
            <svg
              className="w-4 h-4 transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                color: 'var(--color-text-muted)',
                transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      )}
      {title && <div className="mx-3.5" style={{ height: '1px', background: 'var(--color-border)' }} />}
      {(!collapsible || open) && (
        <div className="px-3.5 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
