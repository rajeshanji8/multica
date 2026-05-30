import type { Filter } from '../types';

interface FiltersProps {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
}

const OPTIONS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

/** All / Active / Completed segmented control. */
export function Filters({ value, counts, onChange }: FiltersProps) {
  return (
    <div className="filters" role="group" aria-label="Filter todos">
      {OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`filters__btn${value === key ? ' filters__btn--active' : ''}`}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {label} <span className="filters__count">{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}
