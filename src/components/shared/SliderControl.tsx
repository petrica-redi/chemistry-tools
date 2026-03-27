'use client';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  color?: string;
  formatValue?: (v: number) => string;
}

export default function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  color = 'var(--color-accent-blue)',
  formatValue,
}: SliderControlProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
          {label}
        </label>
        <span className="font-mono text-[11px] font-bold" style={{ color }}>
          {displayValue}
          {unit && (
            <span className="text-[var(--color-text-muted)] font-normal ml-0.5">
              {unit}
            </span>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
