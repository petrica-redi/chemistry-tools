'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS } from '@/types';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] min-w-[260px] h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col overflow-y-auto">
      <Link
        href="/"
        className="px-5 py-5 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
      >
        <h1 className="text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] bg-clip-text text-transparent">
          Chemistry Tools
        </h1>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-mono tracking-wide">
          Scientific Simulation Platform
        </p>
      </Link>

      <nav className="flex-1 py-2">
        {TOOLS.map((tool) => {
          const isActive = pathname === tool.href;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-all border-l-2 ${
                isActive
                  ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-accent-blue)] text-[var(--color-text-primary)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <div>
                <div className="font-semibold text-[13px]">{tool.shortName}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {tool.tags.join(' · ')}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--color-border)] text-[9px] text-[var(--color-text-muted)] font-mono">
        Built for research &amp; teaching
      </div>
    </aside>
  );
}
