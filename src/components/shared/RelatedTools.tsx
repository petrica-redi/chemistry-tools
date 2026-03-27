'use client';

import Link from 'next/link';
import { getConnectionsFrom, TOOL_META, type ToolId } from '@/lib/connections';

interface RelatedToolsProps {
  toolId: ToolId;
  /** Outbound links to pass as URL params, keyed by target toolId */
  links?: Record<string, string>;
}

export default function RelatedTools({ toolId, links = {} }: RelatedToolsProps) {
  const connections = getConnectionsFrom(toolId);
  if (connections.length === 0) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      {/* Section label */}
      <div
        className="flex items-center gap-1.5 px-1"
      >
        <svg className="w-3 h-3 shrink-0" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span
          className="text-[9px] font-bold tracking-[0.15em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Connect to
        </span>
      </div>

      {connections.map((conn) => {
        const target = TOOL_META[conn.to];
        const href = links[conn.to]
          ? `${target.href}${links[conn.to]}`
          : target.href;

        return (
          <Link
            key={`${conn.from}-${conn.to}`}
            href={href}
            className="group block rounded-xl p-3 transition-all duration-150"
            style={{
              background: `color-mix(in srgb, ${conn.accent} 7%, #ffffff)`,
              border: `1px solid color-mix(in srgb, ${conn.accent} 22%, var(--color-border))`,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `color-mix(in srgb, ${conn.accent} 12%, #ffffff)`;
              el.style.borderColor = `color-mix(in srgb, ${conn.accent} 35%, var(--color-border))`;
              el.style.boxShadow = `0 4px 14px color-mix(in srgb, ${conn.accent} 12%, transparent)`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `color-mix(in srgb, ${conn.accent} 7%, #ffffff)`;
              el.style.borderColor = `color-mix(in srgb, ${conn.accent} 22%, var(--color-border))`;
              el.style.boxShadow = 'none';
            }}
          >
            {/* Target tool badge */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm leading-none">{target.icon}</span>
                <span
                  className="text-[10.5px] font-bold"
                  style={{ color: conn.accent }}
                >
                  {target.label}
                </span>
              </div>
              <svg
                className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5"
                style={{ color: conn.accent }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Hint text */}
            <p
              className="text-[10px] leading-snug"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {conn.fromHint}
            </p>

            {/* Link label */}
            <div
              className="mt-2 text-[10px] font-semibold font-mono"
              style={{ color: conn.accent }}
            >
              → {conn.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
