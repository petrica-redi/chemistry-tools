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
      className="flex gap-1 p-1.5 rounded-xl w-fit relative"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `inset 0 0 20px rgba(255, 255, 255, 0.05), 0 0 20px ${accent}08`,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative px-3 py-1.5 rounded-[6px] text-[12px] font-500 transition-all duration-200 group overflow-hidden"
            style={{
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              background: isActive ? `${accent}20` : 'transparent',
              color: isActive ? accent : 'var(--color-text-muted)',
              border: isActive ? `1px solid ${accent}33` : '1px solid transparent',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isActive ? `0 0 16px ${accent}40, inset 0 0 8px ${accent}20` : 'none',
            }}
          >
            {/* Bottom accent bar for active tab */}
            {isActive && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] animate-pulse"
                style={{
                  background: accent,
                  boxShadow: `0 0 8px ${accent}80`,
                }}
              />
            )}

            {/* Hover lift effect for inactive tabs */}
            <span
              className="block relative z-10"
              style={{
                fontWeight: isActive ? '600' : '500',
              }}
            >
              {tab.label}
            </span>

            {/* Hover background for inactive tabs */}
            {!isActive && (
              <div
                className="absolute inset-0 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: `rgba(255, 255, 255, 0.04)`,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
