'use client';

interface Tab { id: string; label: string; }

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  accent?: string;
}

export default function TabBar({ tabs, activeTab, onChange, accent = 'var(--color-accent-blue)' }: TabBarProps) {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl w-fit"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold font-mono tracking-wide transition-all duration-150"
            style={{
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: isActive ? `0 0 12px color-mix(in srgb, ${accent} 30%, transparent)` : 'none',
              border: isActive ? `1px solid rgba(255,255,255,0.1)` : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
