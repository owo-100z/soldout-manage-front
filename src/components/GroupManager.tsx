import { useState } from 'react';
import type { MenuItem, OptionItem, ServiceKey } from '../types';
import { SERVICE_LABELS } from '../types';

// 새로운 그룹 데이터 타입: { menu: string[], option: string[] }
type GroupItemData = {
  menu: string[];
  option: string[];
};

interface Props {
  selectedService: ServiceKey;
  menuList: MenuItem[];
  optionList: OptionItem[];
  groupNames: string[];  // 공통 그룹 목록
  groupData: Record<string, GroupItemData>;  // 현재 서비스의 그룹별 데이터 (메뉴/옵션 구분)
  onGroupAdded: (name: string) => void;
  onGroupRemoved: (name: string) => void;  // 그룹 자체를 삭제 (모든 서비스에서)
  onServiceDataRemoved: (groupName: string) => void;  // 현재 서비스의 데이터만 삭제
  onItemToggled: (groupName: string, itemId: string, itemType: 'menu' | 'option') => void;
  onSave: (groupData: Record<string, GroupItemData>) => void;
}

type ItemTab = 'menu' | 'option';

export default function GroupManager({
  selectedService,
  menuList,
  optionList,
  groupNames,
  groupData,
  onGroupAdded,
  onGroupRemoved,
  onServiceDataRemoved,
  onItemToggled,
  onSave,
}: Props) {
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ItemTab>('menu');

  // 그룹 키가 변경되면 첫 번째 그룹 선택
  if (groupNames.length > 0 && !selectedGroupName) {
    setSelectedGroupName(groupNames[0]);
  }

  // 선택된 그룹의 현재 탭에 따른 아이템 목록
  const selectedGroupItems = selectedGroupName
    ? (tab === 'menu'
        ? groupData[selectedGroupName]?.menu || []
        : groupData[selectedGroupName]?.option || [])
    : [];

  const items = (tab === 'menu' ? menuList : optionList).filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    if (groupNames.includes(name)) {
      alert('이미 존재하는 그룹 이름입니다.');
      return;
    }
    onGroupAdded(name);
    setSelectedGroupName(name);
    setNewGroupName('');
  };

  const handleRemoveGroup = (name: string) => {
    onServiceDataRemoved(name);
    const remainingNames = groupNames.filter((n) => n !== name);
    setSelectedGroupName(remainingNames[0] || null);
  };

  const handleToggleItem = (itemId: string) => {
    if (!selectedGroupName) return;
    onItemToggled(selectedGroupName, itemId, tab);
  };

  const isSelected = (id: string) => selectedGroupItems.includes(id);
  
  // 그룹별 총 개수 (메뉴 + 옵션)
  const getGroupCount = (groupName: string): number => {
    const data = groupData[groupName];
    if (!data) return 0;
    return (data.menu?.length || 0) + (data.option?.length || 0);
  };

  return (
    <div className="space-y-4">
      {/* 그룹 목록 + 추가 */}
      <div>
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">그룹</p>
        <div className="flex flex-wrap gap-2 mb-2 min-h-8">
          {groupNames.length === 0 && (
            <p className="text-sm text-zinc-400 py-1">그룹이 없습니다. 추가해주세요.</p>
          )}
          {groupNames.map((name) => (
            <div key={name} className="flex items-center gap-0.5">
              <button
                onClick={() => setSelectedGroupName(name)}
                className={`px-3 py-1.5 rounded-l-full text-sm font-semibold transition-all border-y border-l ${
                  selectedGroupName === name
                    ? 'bg-zinc-800 text-white border-zinc-800'
                    : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500'
                }`}
              >
                {name}
                <span className="ml-1 opacity-60">({getGroupCount(name)})</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${selectedGroupName}" 버튼을 삭제하시겠습니까?`)) {
                    handleRemoveGroup(name);
                  }
                }}
                className={`px-2 py-1.5 rounded-r-full text-sm transition-all border-y border-r ${
                  selectedGroupName === name
                    ? 'bg-zinc-700 text-zinc-300 border-zinc-800 hover:bg-red-500 hover:border-red-500 hover:text-white'
                    : 'bg-white text-zinc-300 border-zinc-300 hover:bg-red-50 hover:text-red-400 hover:border-red-300'
                }`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* 그룹 추가 입력 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="새 그룹 이름 입력 후 Enter"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-base focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <button
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
            className="px-4 py-2 rounded-lg text-base font-semibold bg-zinc-800 hover:bg-zinc-900 text-white transition-colors disabled:opacity-40"
          >
            추가
          </button>
        </div>
      </div>

      <div className="border border-zinc-100 rounded-xl p-3 space-y-3">
        {selectedGroupName && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              <span className="font-bold text-zinc-800">{selectedGroupName}</span> 그룹 &nbsp;·&nbsp;
              <span className="text-zinc-400">{SERVICE_LABELS[selectedService]} 메뉴/옵션 선택</span>
            </p>
            <button
              onClick={() => {
                onGroupRemoved(selectedGroupName)
              }}
              className="text-xs underline"
            >
              초기화
            </button>
          </div>
        )}

        {/* 메뉴 / 옵션 탭 */}
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
          {(['menu', 'option'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(''); }}
              className={`px-4 py-1.5 rounded-md text-base font-medium transition-all ${
                tab === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {t === 'menu'
                ? `메뉴 (${menuList.length})`
                : `옵션 (${optionList.length})`}
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
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 text-base focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {/* 아이템 목록 */}
        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-400 py-6 text-center">
              {tab === 'menu' ? '메뉴' : '옵션'}가 없습니다
            </p>
          ) : (
            items.map((item) => {
              const selected = isSelected(item.id);
              // 그룹이 비어있으면 선택 불가능 (읽기 전용)
              const isDisabled = groupNames.length === 0;
              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && handleToggleItem(item.id)}
                  disabled={isDisabled}
                  className={`w-full text-left px-3 py-2 rounded-lg text-base transition-colors flex items-center justify-between ${
                    isDisabled
                      ? 'text-zinc-300 cursor-not-allowed bg-zinc-50'
                      : selected
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  {selected && !isDisabled && <span className="text-sm ml-2 shrink-0 text-emerald-400">✓</span>}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 저장 */}
      <button
        onClick={() => onSave(groupData)}
        className="w-full py-2.5 rounded-xl text-base font-semibold bg-zinc-800 hover:bg-zinc-900 text-white transition-colors"
      >
        저장
      </button>
    </div>
  );
}