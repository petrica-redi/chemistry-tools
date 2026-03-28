'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

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
  const [maxHeight, setMaxHeight] = useState<string | number>(defaultOpen ? 'auto' : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (open) {
        setMaxHeight(contentRef.current.scrollHeight);
      } else {
        setMaxHeight(0);
      }
    }
  }, [open]);

  return (
    <div
      className={`rounded-xl overflow-hidden transition-shadow duration-300 ${className}`}
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      {accent && (
        <div
          style={{
            height: '2px',
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}66 50%, rgba(255, 255, 255, 0) 100%)`,
          }}
        />
      )}
      {title && (
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 hover:bg-opacity-5"
          style={{
            cursor: collapsible ? 'pointer' : 'default',
            backgroundColor: accent ? `${accent}08` : 'transparent',
          }}
          onClick={() => collapsible && setOpen((v) => !v)}
          type="button"
        >
          <span
            className="text-[11px] font-600 tracking-[0.05em] uppercase flex items-center gap-2"
            style={{ color: accent ?? 'var(--color-text-muted)' }}
          >
            {accent && (
              <span
                className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                style={{
                  background: accent,
                  boxShadow: `0 0 8px ${accent}66`,
                }}
              />
            )}
            {title}
          </span>
          {collapsible && (
            <svg
              className="w-4.5 h-4.5 flex-shrink-0 transition-transform"
              style={{
                color: open && accent ? accent : 'var(--color-text-muted)',
                transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                transitionDuration: '400ms',
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
      {title && (
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
      )}
      <div
        ref={contentRef}
        style={{
          maxHeight: collapsible ? maxHeight : 'auto',
          overflow: 'hidden',
          transition: collapsible ? 'max-height 300ms ease-in-out' : 'none',
        }}
      >
        <div className="px-4 py-3.5">
          {children}
        </div>
      </div>
    </div>
  );
}
