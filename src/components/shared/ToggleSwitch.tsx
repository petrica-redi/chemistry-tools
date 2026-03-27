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
  color = 'var(--color-brand)',
}: ToggleSwitchProps) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer gap-3 transition-colors duration-150 hover:text-[var(--color-text-primary)]">
      <span
        className="text-[11px] font-500 select-none transition-colors duration-150"
        style={{ color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
      >
        {label}
      </span>

      <div
        role="switch"
        aria-checked={checked}
        className="relative shrink-0 w-9 h-5 rounded-full transition-all duration-150 cursor-pointer"
        style={{
          background: checked ? color : 'rgba(255, 255, 255, 0.08)',
          border: `1px solid ${checked ? color : 'rgba(255, 255, 255, 0.12)'}`,
        }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-150"
          style={{
            left: checked ? '16px' : '2px',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          }}
        />
      </div>
    </label>
  );
}
