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
      className="flex gap-1.5 p-1.5 rounded-[12px] w-fit backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.5) 0%, rgba(15, 20, 40, 0.5) 100%)',
        border: '1px solid rgba(0, 217, 255, 0.15)',
        boxShadow: 'inset 0 0 12px rgba(0, 217, 255, 0.05)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="px-4 py-1.5 rounded-[10px] text-[11.5px] font-semibold font-mono tracking-wide transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:translate-y-[-2px]"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`
                : 'transparent',
              color: isActive ? '#fff' : 'var(--color-text-muted)',
              boxShadow: isActive ? `0 0 12px ${accent}40, 0 4px 12px rgba(0, 0, 0, 0.2)` : 'none',
              border: isActive ? `1px solid ${accent}` : '1px solid transparent',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
