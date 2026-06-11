import { ALL_SERVICES, SERVICE_LABELS, type ServiceKey } from '../types';

interface Props {
  selected: ServiceKey[];
  onChange: (services: ServiceKey[]) => void;
}

export default function ServiceSelector({ selected, onChange }: Props) {
  const toggle = (service: ServiceKey) => {
    if (selected.includes(service)) {
      if (selected.length === 1) return; // 최소 1개 선택
      onChange(selected.filter((s) => s !== service));
    } else {
      onChange([...selected, service]);
    }
  };

  const isAll = selected.length === ALL_SERVICES.length;

  const toggleAll = () => {
    onChange(isAll ? [ALL_SERVICES[0]] : [...ALL_SERVICES]);
  };

  return (
    // 부모 div에 가로 스크롤(overflow-x-auto)과 스크롤바 숨김 처리
    <div className="flex items-center gap-2 w-full overflow-x-auto scrollbar-hide">
      <button
        onClick={toggleAll}
        className={`flex-1 min-w-fit whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold transition-all border ${
          isAll
            ? 'bg-zinc-800 text-white border-zinc-800'
            : 'bg-transparent text-zinc-500 border-zinc-300 hover:border-zinc-500'
        }`}
      >
        전체
      </button>
      {ALL_SERVICES.map((service) => (
        <button
          key={service}
          onClick={() => toggle(service)}
          className={`flex-1 min-w-fit whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold transition-all border ${
            selected.includes(service)
              ? 'bg-zinc-800 text-white border-zinc-800'
              : 'bg-transparent text-zinc-500 border-zinc-300 hover:border-zinc-500'
          }`}
        >
          {SERVICE_LABELS[service]}
        </button>
      ))}
    </div>
  );
}
