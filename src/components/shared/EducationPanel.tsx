'use client';

import { ReactNode, useState } from 'react';

interface EducationPanelProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  accent?: string;
}

/**
 * A collapsible education panel for displaying theory, definitions,
 * and learning content alongside simulator controls.
 */
export default function EducationPanel({
  title,
  icon,
  children,
  className = '',
  defaultOpen = false,
  accent = 'var(--color-accent-cyan)',
}: EducationPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-[10px] overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(34,211,238,0.04) 0%, rgba(129,140,248,0.04) 100%)',
        border: `1px solid ${open ? accent + '33' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.2s ease',
      }}
    >
      <button
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-[rgba(255,255,255,0.03)]"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span
          className="text-[10px] font-600 tracking-[0.05em] uppercase flex items-center gap-2"
          style={{ color: accent }}
        >
          {icon && <span className="text-[12px]">{icon}</span>}
          {title}
        </span>
        <svg
          className="w-4 h-4 transition-transform duration-200"
          style={{
            color: accent,
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            opacity: 0.7,
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="mx-3.5" style={{ height: '1px', background: accent + '22' }} />
          <div className="px-3.5 py-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

/** Reusable formula block for displaying equations inside EducationPanel */
export function FormulaBlock({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-2.5 border border-[var(--color-border)] mb-2 last:mb-0">
      {label && (
        <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
          {label}
        </div>
      )}
      <div className="font-mono text-[11px] text-[var(--color-text-primary)] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

/** Inline definition term */
export function DefTerm({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <span className="font-semibold text-[var(--color-accent-cyan)]">{term}:</span>{' '}
      <span>{children}</span>
    </div>
  );
}
