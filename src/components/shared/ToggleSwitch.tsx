'use client';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
}

export default function ToggleSwitch({
  label,
  checked,
  onChange,
  color = 'var(--color-accent-blue)',
}: ToggleSwitchProps) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="text-[12px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
        {label}
      </span>
      <div
        className="relative w-9 h-5 rounded-full transition-colors"
        style={{ background: checked ? color : 'var(--color-border)' }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform"
          style={{
            left: '3px',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </div>
    </label>
  );
}
