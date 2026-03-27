import Link from 'next/link';
import type { Tool } from '@/types';

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="group block rounded-[12px] p-5 transition-all duration-150 hover:bg-[var(--color-bg-secondary)]/60"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <span
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-[10px] shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {tool.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-600 text-[var(--color-text-primary)] leading-snug">
            {tool.name}
          </h2>
          <p className="text-[12px] mt-1.5 leading-relaxed line-clamp-2 text-[var(--color-text-secondary)]">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-400 px-2 py-1 rounded-[6px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <svg
          className="w-4 h-4 shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-all duration-150 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
