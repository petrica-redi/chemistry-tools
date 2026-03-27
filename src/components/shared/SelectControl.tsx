'use client';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SelectControlProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  grouped?: boolean;
}

export default function SelectControl({
  label,
  value,
  options,
  onChange,
  grouped = false,
}: SelectControlProps) {
  const renderOptions = () => {
    if (!grouped) {
      return options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ));
    }
    const groups: Record<string, SelectOption[]> = {};
    for (const opt of options) {
      const g = opt.group || '';
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    }
    return Object.entries(groups).map(([group, opts]) =>
      group ? (
        <optgroup key={group} label={group}>
          {opts.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ) : (
        opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))
      )
    );
  };

  return (
    <div className="mb-3">
      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {renderOptions()}
      </select>
    </div>
  );
}
