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
      className="flex gap-1 p-1 rounded-[8px] w-fit"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="px-3 py-1.5 rounded-[6px] text-[11px] font-500 transition-all duration-150"
            style={{
              background: isActive ? `${accent}14` : 'transparent',
              color: isActive ? accent : 'var(--color-text-muted)',
              border: isActive ? `1px solid ${accent}22` : 'transparent',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
