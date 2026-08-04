import { useMemo } from 'react';
import { useActivate, useSoldout } from '../hooks/useApi';
import type { MenuGroups, RunResponse, ServiceKey } from '../types';

interface Props {
  services: ServiceKey[];
  groups: MenuGroups;
  onResult: (title: string, response: RunResponse) => void;
  onError: (message: string) => void;
}

type IdMap = Partial<Record<ServiceKey, string[]>>;

/** 선택된 플랫폼들의 그룹을 이름 기준으로 합친다. */
function unifyGroups(groups: MenuGroups, services: ServiceKey[]) {
  const counts = new Map<string, number>();
  for (const service of services) {
    for (const [name, data] of Object.entries(groups[service] ?? {})) {
      const n = (data.menu?.length ?? 0) + (data.option?.length ?? 0);
      if (n > 0) counts.set(name, (counts.get(name) ?? 0) + n);
    }
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

/** 그룹 하나를 플랫폼별 ID 목록으로 펼친다. */
function buildPayload(groups: MenuGroups, services: ServiceKey[], groupName: string) {
  const menuList: IdMap = {};
  const optionList: IdMap = {};

  for (const service of services) {
    const data = groups[service]?.[groupName];
    if (!data) continue;
    if (data.menu?.length) menuList[service] = data.menu;
    if (data.option?.length) optionList[service] = data.option;
  }

  // 대상이 하나도 없는 플랫폼은 아예 요청에서 제외한다
  const targets = services.filter((s) => menuList[s]?.length || optionList[s]?.length);
  return { services: targets, menuList, optionList };
}

export default function MenuGrid({ services, groups, onResult, onError }: Props) {
  const soldout = useSoldout();
  const activate = useActivate();
  const busy = soldout.isPending || activate.isPending;

  const unified = useMemo(() => unifyGroups(groups, services), [groups, services]);

  const run = (groupName: string, mode: 'soldout' | 'active') => {
    const payload = buildPayload(groups, services, groupName);
    if (!payload.services.length) {
      onError(`'${groupName}' 그룹에 선택된 플랫폼의 항목이 없습니다`);
      return;
    }

    const mutation = mode === 'soldout' ? soldout : activate;
    const title = `${groupName} ${mode === 'soldout' ? '품절' : '판매재개'}`;
    mutation
      .mutateAsync(payload)
      .then((res) => onResult(title, res))
      .catch((e: Error) => onError(e.message));
  };

  if (!unified.length) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="text-zinc-500">등록된 메뉴 그룹이 없습니다.</p>
        <p className="mt-1 text-sm text-zinc-400">‘그룹’ 탭에서 먼저 만들어 주세요.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <h2 className="font-bold text-zinc-900">메뉴 품절</h2>

      <ul className="space-y-2">
        {unified.map(({ name, count }) => (
          <li key={name} className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2">
            <div className="min-w-0 flex-1 px-2">
              <p className="truncate font-semibold text-zinc-800">{name}</p>
              <p className="text-xs text-zinc-500">{count}개 항목</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(name, 'soldout')}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              품절
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(name, 'active')}
              className="rounded-lg border-2 border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 disabled:opacity-50"
            >
              해제
            </button>
          </li>
        ))}
      </ul>

      {busy && <p className="text-center text-sm text-zinc-500">플랫폼에 반영 중…</p>}
    </section>
  );
}
