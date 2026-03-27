import Link from 'next/link';
import type { Tool } from '@/types';

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className={`group block rounded-[20px] p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.5) 0%, rgba(26, 31, 58, 0.3) 100%)',
        border: `1.5px solid var(--color-border)`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 20px rgba(255, 46, 99, 0.05), 0 8px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)',
            border: '1.5px solid rgba(0, 217, 255, 0.2)',
            boxShadow: '0 0 12px rgba(0, 217, 255, 0.1)',
          }}
        >
          {tool.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className={`text-[16px] font-bold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent leading-snug`}>
            {tool.name}
          </h2>
          <p className="text-[12px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 rounded-[8px]"
                style={{
                  background: 'rgba(0, 217, 255, 0.08)',
                  border: '1px solid rgba(0, 217, 255, 0.15)',
                  color: 'var(--color-accent-cyan)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <svg
          className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:translate-y-[-4px]"
          style={{ color: 'var(--color-accent-cyan)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
        </svg>
      </div>
    </Link>
  );
}
