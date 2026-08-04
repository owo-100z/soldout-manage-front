import { ALL_SERVICES, SERVICE_LABELS, type ServiceKey } from '../types';

interface Props {
  selected: ServiceKey[];
  onChange: (next: ServiceKey[]) => void;
  disabled?: boolean;
}

export default function ServiceSelector({ selected, onChange, disabled }: Props) {
  const allSelected = selected.length === ALL_SERVICES.length;

  const toggle = (key: ServiceKey) => {
    const next = selected.includes(key)
      ? selected.filter((s) => s !== key)
      : [...ALL_SERVICES].filter((s) => s === key || selected.includes(s));
    // 최소 1개는 남긴다 — 대상이 없으면 아무 동작도 할 수 없다
    if (next.length) onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="플랫폼 선택">
      <button
        type="button"
        disabled={disabled}
        aria-pressed={allSelected}
        onClick={() => onChange([...ALL_SERVICES])}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
          allSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
        }`}
      >
        전체
      </button>

      {ALL_SERVICES.map((key) => {
        const on = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => toggle(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              on ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {SERVICE_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
