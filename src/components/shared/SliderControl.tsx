'use client';

import { useRef, useEffect } from 'react';

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
  color = 'var(--color-brand)',
  formatValue,
}: SliderControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = formatValue ? formatValue(value) : value.toString();

  // Update the CSS custom property for gradient fill
  useEffect(() => {
    if (!inputRef.current) return;
    const pct = ((value - min) / (max - min)) * 100;
    inputRef.current.style.setProperty('--slider-pct', `${pct}%`);
    inputRef.current.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #2a3555 ${pct}%, #2a3555 100%)`;
  }, [value, min, max, color]);

  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
        <span
          className="font-mono text-[11px] font-bold px-2 py-1 rounded-[8px] transition-all duration-300"
          style={{
            color: '#fff',
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            border: `1px solid ${color}`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        >
          {displayValue}{unit && <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>{unit}</span>}
        </span>
      </div>
      <input
        ref={inputRef}
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
