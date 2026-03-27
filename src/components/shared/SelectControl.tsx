'use client';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SelectControlProps {
  label: string;
  value: string;
  options?: SelectOption[];
  groups?: { label: string; options: { label: string; value: string }[] }[];
  onChange: (value: string) => void;
  grouped?: boolean;
}

export default function SelectControl({
  label,
  value,
  options,
  groups,
  onChange,
  grouped = false,
}: SelectControlProps) {
  const renderOptions = () => {
    if (groups) {
      return groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </optgroup>
      ));
    }
    if (!options) return null;
    if (!grouped) {
      return options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ));
    }
    const grps: Record<string, SelectOption[]> = {};
    for (const opt of options) {
      const g = opt.group ?? '';
      if (!grps[g]) grps[g] = [];
      grps[g].push(opt);
    }
    return Object.entries(grps).map(([group, opts]) =>
      group ? (
        <optgroup key={group} label={group}>
          {opts.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </optgroup>
      ) : (
        opts.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))
      )
    );
  };

  return (
    <div className="mb-3.5">
      <label
        className="block text-[11px] font-medium mb-1.5"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {renderOptions()}
      </select>
    </div>
  );
}
