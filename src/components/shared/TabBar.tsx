'use client';

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex border-b border-[var(--color-border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-[12px] font-semibold font-mono tracking-wide transition-all border-b-2 ${
            activeTab === tab.id
              ? 'text-[var(--color-text-primary)] border-[var(--color-accent-blue)] bg-[var(--color-bg-tertiary)]'
              : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-secondary)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
