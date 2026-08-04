import { useMemo, useState } from 'react';
import Header from '../components/Header';
import { normalizeMenus, normalizeOptions } from '../lib/normalize';
import { useMenuGroups, useRefreshMenus, useSaveMenuGroups, useShopInfo } from '../hooks/useApi';
import { ALL_SERVICES, SERVICE_LABELS, type MenuGroups, type ServiceKey } from '../types';

type Tab = 'menu' | 'option';

export default function SettingsPage() {
  const [service, setService] = useState<ServiceKey>('baemin');
  const [tab, setTab] = useState<Tab>('menu');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<MenuGroups | null>(null);

  const shopQuery = useShopInfo([service]);
  const groupsQuery = useMenuGroups();
  const save = useSaveMenuGroups();
  const refresh = useRefreshMenus();

  // 저장 전 편집 상태. 서버 값이 오기 전에는 서버 값을 그대로 보여준다.
  const groups: MenuGroups = draft ?? groupsQuery.data ?? {};

  const items = useMemo(() => {
    const data = shopQuery.data?.results?.[service];
    return tab === 'menu'
      ? normalizeMenus(service, data?.menuList)
      : normalizeOptions(service, data?.optionList);
  }, [shopQuery.data, service, tab]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const groupNames = useMemo(() => {
    const names = new Set<string>();
    for (const key of ALL_SERVICES) Object.keys(groups[key] ?? {}).forEach((n) => names.add(n));
    return [...names];
  }, [groups]);

  const current = selectedGroup ? groups[service]?.[selectedGroup] : undefined;
  const currentIds = new Set(current?.[tab] ?? []);

  const update = (next: MenuGroups) => setDraft(next);

  const addGroup = () => {
    const name = window.prompt('새 그룹 이름')?.trim();
    if (!name) return;
    if (groupNames.includes(name)) return window.alert('이미 있는 그룹입니다');

    update({ ...groups, [service]: { ...groups[service], [name]: { menu: [], option: [] } } });
    setSelectedGroup(name);
  };

  const removeGroup = (name: string) => {
    if (!window.confirm(`'${name}' 그룹을 모든 플랫폼에서 삭제합니다. 계속할까요?`)) return;

    const next: MenuGroups = {};
    for (const key of ALL_SERVICES) {
      if (!groups[key]) continue;
      const { [name]: _removed, ...rest } = groups[key];
      next[key] = rest;
    }
    update(next);
    if (selectedGroup === name) setSelectedGroup(null);
  };

  const toggleItem = (id: string) => {
    if (!selectedGroup) return;
    const existing = groups[service]?.[selectedGroup] ?? { menu: [], option: [] };
    const list = existing[tab];
    const nextList = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

    update({
      ...groups,
      [service]: {
        ...groups[service],
        [selectedGroup]: { ...existing, [tab]: nextList },
      },
    });
  };

  const shopResult = shopQuery.data?.results?.[service];

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Header title="메뉴 그룹 설정" />

      <main className="mx-auto max-w-3xl space-y-4 p-4">
        {/* 플랫폼 */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="플랫폼 선택">
          {ALL_SERVICES.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={service === key}
              onClick={() => {
                setService(key);
                setSearch('');
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                service === key ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {SERVICE_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={refresh.isPending || shopQuery.isFetching}
            onClick={() => refresh.mutate(service)}
            className="flex-1 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 font-semibold text-zinc-700 disabled:opacity-50"
          >
            {refresh.isPending || shopQuery.isFetching ? '불러오는 중…' : '메뉴 다시 불러오기'}
          </button>
          <button
            type="button"
            disabled={save.isPending || !draft}
            onClick={() => save.mutate(groups, { onSuccess: () => setDraft(null) })}
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {save.isPending ? '저장 중…' : draft ? '변경사항 저장' : '저장됨'}
          </button>
        </div>

        {save.isError && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            저장 실패: {(save.error as Error).message}
          </p>
        )}

        {shopQuery.isError && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            메뉴를 불러오지 못했습니다: {(shopQuery.error as Error).message}
          </p>
        )}
        {shopResult && !shopResult.ok && (
          <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {SERVICE_LABELS[service]}: {shopResult.error ?? '메뉴를 불러오지 못했습니다'}
          </p>
        )}

        {/* 그룹 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 font-bold text-zinc-900">그룹</h2>
          <div className="flex flex-wrap gap-2">
            {groupNames.map((name) => (
              <span
                key={name}
                className={`inline-flex items-center gap-1 rounded-full py-1.5 pl-4 pr-1.5 text-sm font-semibold ${
                  selectedGroup === name ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                <button type="button" onClick={() => setSelectedGroup(name)}>
                  {name}
                </button>
                <button
                  type="button"
                  aria-label={`${name} 그룹 삭제`}
                  onClick={() => removeGroup(name)}
                  className="rounded-full px-1.5 opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={addGroup}
              className="rounded-full border-2 border-dashed border-zinc-300 px-4 py-1.5 text-sm font-semibold text-zinc-500"
            >
              + 새 그룹
            </button>
          </div>
        </section>

        {/* 항목 선택 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
            <>
              <div className="mb-3 flex gap-2" role="group" aria-label="항목 종류">
                {(['menu', 'option'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tab === t}
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
                      tab === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {t === 'menu' ? '메뉴' : '옵션'}
                    {selectedGroup && (
                      <span className="ml-1 opacity-70">
                        {(groups[service]?.[selectedGroup]?.[t] ?? []).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="sr-only">항목 검색</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="이름으로 검색"
                  className="mb-3 h-12 w-full rounded-xl border-2 border-zinc-200 px-4"
                />
              </label>

              {shopQuery.isPending ? (
                <p className="py-8 text-center text-zinc-500">불러오는 중…</p>
              ) : visibleItems.length === 0 ? (
                <p className="py-8 text-center text-zinc-400">
                  {items.length === 0 ? '항목이 없습니다' : '검색 결과가 없습니다'}
                </p>
              ) : (
                <ul className="max-h-96 space-y-1 overflow-y-auto">
                  {visibleItems.map((item) => {
                    const on = currentIds.has(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          disabled={!selectedGroup}
                          onClick={() => toggleItem(item.id)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${
                            on ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <span aria-hidden="true" className="w-4 font-bold">
                            {on ? '✓' : ''}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
        </section>
      </main>
    </div>
  );
}
