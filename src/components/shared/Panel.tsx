'use client';

import { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div
      className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-4 ${className}`}
    >
      {title && (
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
