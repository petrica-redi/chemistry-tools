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
    <label className="flex items-center justify-between py-1.5 cursor-pointer group gap-3">
      <span
        className="text-[11.5px] select-none transition-colors duration-150"
        style={{ color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
      >
        {label}
      </span>

      <div
        role="switch"
        aria-checked={checked}
        className="relative shrink-0 w-9 h-[18px] rounded-full transition-all duration-200 cursor-pointer"
        style={{
          background: checked
            ? `color-mix(in srgb, ${color} 80%, #000)`
            : 'rgba(255,255,255,0.08)',
          border: checked
            ? `1px solid color-mix(in srgb, ${color} 60%, transparent)`
            : '1px solid rgba(255,255,255,0.12)',
          boxShadow: checked ? `0 0 10px color-mix(in srgb, ${color} 40%, transparent)` : 'none',
        }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-[2px] w-[13px] h-[13px] rounded-full shadow-md transition-all duration-200"
          style={{
            left: '2px',
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
            background: checked ? '#fff' : 'rgba(255,255,255,0.5)',
            boxShadow: checked ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
          }}
        />
      </div>
    </label>
  );
}
