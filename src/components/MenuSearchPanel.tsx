import { useState } from 'react';
import type { MenuItem, OptionItem, SavedMenu } from '../types';

interface Props {
  menuList: MenuItem[];
  optionList: OptionItem[];
  savedMenus: SavedMenu[];
  onSave: (menus: SavedMenu[]) => void;
}

export default function MenuSearchPanel({ menuList, optionList, savedMenus, onSave }: Props) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'menu' | 'option'>('menu');
  const [selected, setSelected] = useState<SavedMenu[]>(savedMenus);

  const items = (tab === 'menu' ? menuList : optionList).map((item) => ({
    ...item,
    type: tab,
  }));

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIds = new Set(selected.map((s) => s.id));

  const toggle = (item: MenuItem | OptionItem) => {
    if (selectedIds.has(item.id)) {
      setSelected(selected.filter((s) => s.id !== item.id));
    } else {
      // service 속성은 나중에 GroupManager에서 설정됨
      setSelected([...selected, { id: item.id, name: item.name, type: tab, service: 'baemin' } as SavedMenu]);
    }
  };

  const removeSelected = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
        {(['menu', 'option'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {t === 'menu' ? '메뉴' : '옵션'}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-base">🔍</span>
        <input
          type="text"
          placeholder="검색어 입력"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 text-base focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white"
        />
      </div>

      {/* 선택 목록 + 가능 목록 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 선택 가능 목록 */}
        <div>
          <p className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wide">선택 가능</p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">항목 없음</p>
            ) : (
              filtered
                .filter((item) => !selectedIds.has(item.id))
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item)}
                    className="w-full text-left px-3 py-2 rounded-lg text-base text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    {item.name}
                  </button>
                ))
            )}
          </div>
        </div>

        {/* 선택된 목록 */}
        <div>
          <p className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wide">선택됨 ({selected.length})</p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {selected.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">선택 없음</p>
            ) : (
              selected.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800 text-white text-base"
                >
                  <span className="truncate">{item.name}</span>
                  <button
                    onClick={() => removeSelected(item.id)}
                    className="ml-2 text-zinc-400 hover:text-white text-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={() => onSave(selected)}
        className="w-full py-2.5 rounded-xl text-base font-semibold bg-zinc-800 hover:bg-zinc-900 text-white transition-colors"
      >
        저장
      </button>
    </div>
  );
}
