'use client';

interface Tab { id: string; label: string; }

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  accent?: string;
}

export default function TabBar({ tabs, activeTab, onChange, accent = 'var(--color-brand)' }: TabBarProps) {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl w-fit"
      style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold font-mono tracking-wide transition-all duration-150"
            style={{
              background: isActive ? '#fff' : 'transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
              border: isActive ? `1px solid var(--color-border)` : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
