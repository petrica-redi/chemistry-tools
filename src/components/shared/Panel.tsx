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
      className={`rounded-[10px] overflow-hidden ${className}`}
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {title && (
        <button
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-[var(--color-bg-tertiary)]/60"
          style={{ cursor: collapsible ? 'pointer' : 'default' }}
          onClick={() => collapsible && setOpen((v) => !v)}
          type="button"
        >
          <span
            className="text-[10px] font-600 tracking-[0.05em] uppercase flex items-center gap-2"
            style={{ color: accent ?? 'var(--color-text-muted)' }}
          >
            {accent && (
              <span
                className="w-1 h-1 rounded-full inline-block"
                style={{ background: accent }}
              />
            )}
            {title}
          </span>
          {collapsible && (
            <svg
              className="w-4 h-4 transition-transform duration-150"
              style={{
                color: 'var(--color-text-muted)',
                transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      )}
      {title && <div className="mx-3.5" style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />}
      {(!collapsible || open) && (
        <div className="px-3.5 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
