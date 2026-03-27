import Link from 'next/link';
import type { Tool } from '@/types';

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className={`group block bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-border-hover)] transition-all duration-200 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {tool.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className={`text-[15px] font-bold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent leading-snug`}>
            {tool.name}
          </h2>
          <p className="text-[12px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <svg
          className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150 group-hover:translate-x-0.5"
          style={{ color: 'var(--color-accent-blue)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
        </svg>
      </div>
    </Link>
  );
}
