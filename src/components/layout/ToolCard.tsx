import Link from 'next/link';
import type { Tool } from '@/types';

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="group block bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-border-hover)] transition-all hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <h2
            className={`text-lg font-bold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`}
          >
            {tool.name}
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-2 leading-relaxed">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-blue)] transition-colors text-xl">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
