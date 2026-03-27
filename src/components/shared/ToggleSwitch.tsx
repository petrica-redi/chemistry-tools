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
    <label className="flex items-center justify-between py-2 cursor-pointer group gap-3 transition-colors duration-300 hover:text-[var(--color-text-primary)]">
      <span
        className="text-[11.5px] select-none transition-colors duration-300"
        style={{ color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
      >
        {label}
      </span>

      <div
        role="switch"
        aria-checked={checked}
        className="relative shrink-0 w-10 h-[22px] rounded-full transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) cursor-pointer"
        style={{
          background: checked
            ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
            : 'linear-gradient(135deg, #2a3555 0%, #1a1f3a 100%)',
          border: checked
            ? `1.5px solid ${color}`
            : '1px solid var(--color-border)',
          boxShadow: checked ? `0 0 16px ${color}40, 0 0 32px ${color}20` : 'inset 0 0 8px rgba(0, 0, 0, 0.2)',
        }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)"
          style={{
            left: '2px',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            background: checked ? '#fff' : 'rgba(255,255,255,0.4)',
            boxShadow: checked ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
          }}
        />
      </div>
    </label>
  );
}
