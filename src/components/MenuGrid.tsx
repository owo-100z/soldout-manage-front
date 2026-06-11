import { useMemo } from 'react';
import { useActive, useSoldout } from '../hooks/useMenu';
import type { ServiceKey, ServiceMenuGroups } from '../types';

interface Props {
  selectedServices: ServiceKey[];
  // 새로운 그룹 구조: { baemin: { "그룹명": { menu: [menuId1, ...], option: [optionId1, ...] } }, coupang: { ... } }
  groups: ServiceMenuGroups;
  isLoading?: boolean;  // 외부에서 전달받는 로딩 상태
}

export default function MenuGrid({ selectedServices, groups, isLoading: externalLoading }: Props) {
  const soldout = useSoldout();
  const active = useActive();
  const isPending = soldout.isPending || active.isPending || externalLoading;

  // 그룹별로 통합 (서비스별 구분 없이)
  const unifiedGroups = useMemo(() => {
    const groupMap = new Map<string, { groupName: string; totalCount: number }>();

    for (const service of selectedServices) {
      const serviceData = groups[service];
      if (!serviceData) continue;

      for (const [groupName, groupData] of Object.entries(serviceData)) {
        const menuCount = groupData.menu?.length || 0;
        const optionCount = groupData.option?.length || 0;
        const totalCount = menuCount + optionCount;
        
        if (totalCount > 0) {
          const existing = groupMap.get(groupName);
          if (existing) {
            existing.totalCount += totalCount;
          } else {
            groupMap.set(groupName, { groupName, totalCount });
          }
        }
      }
    }

    return Array.from(groupMap.values());
  }, [selectedServices, groups]);

  // 선택된 서비스 전체에 대해 품절 처리 (서비스별 menuList, optionList 전송)
  const handleSoldout = (groupName: string) => {
    const menuListByService: Record<ServiceKey, string[]> = {} as Record<ServiceKey, string[]>;
    const optionListByService: Record<ServiceKey, string[]> = {} as Record<ServiceKey, string[]>;
    
    for (const service of selectedServices) {
      const serviceData = groups[service];
      if (serviceData && serviceData[groupName]) {
        const groupData = serviceData[groupName];
        if (groupData.menu && groupData.menu.length > 0) {
          menuListByService[service] = groupData.menu;
        }
        if (groupData.option && groupData.option.length > 0) {
          optionListByService[service] = groupData.option;
        }
      }
    }
    
    // 서비스별 menuList나 optionList가 하나라도 있는지 확인
    const hasMenuList = Object.values(menuListByService).some(list => list && list.length > 0);
    const hasOptionList = Object.values(optionListByService).some(list => list && list.length > 0);
    if (!hasMenuList && !hasOptionList) return;
    
    soldout.mutate({ services: selectedServices, menuList: menuListByService, optionList: optionListByService });
  };

  // 선택된 서비스 전체에 대해 해제 처리 (서비스별 menuList, optionList 전송)
  const handleActive = (groupName: string) => {
    const menuListByService: Record<ServiceKey, string[]> = {} as Record<ServiceKey, string[]>;
    const optionListByService: Record<ServiceKey, string[]> = {} as Record<ServiceKey, string[]>;
    
    for (const service of selectedServices) {
      const serviceData = groups[service];
      if (serviceData && serviceData[groupName]) {
        const groupData = serviceData[groupName];
        if (groupData.menu && groupData.menu.length > 0) {
          menuListByService[service] = groupData.menu;
        }
        if (groupData.option && groupData.option.length > 0) {
          optionListByService[service] = groupData.option;
        }
      }
    }
    
    // 서비스별 menuList나 optionList가 하나라도 있는지 확인
    const hasMenuList = Object.values(menuListByService).some(list => list && list.length > 0);
    const hasOptionList = Object.values(optionListByService).some(list => list && list.length > 0);
    if (!hasMenuList && !hasOptionList) return;
    
    active.mutate({ services: selectedServices, menuList: menuListByService, optionList: optionListByService });
  };

  if (unifiedGroups.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-400 text-base">
        설정에서 그룹을 추가해주세요
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {unifiedGroups.map((group) => (
          <div
            key={group.groupName}
            className="rounded-2xl border border-zinc-200 bg-white p-3 flex flex-col gap-2"
          >
            <div>
              <p className="text-5xl text-center font-bold text-zinc-900 truncate">{group.groupName}</p>
            </div>
            <div className="flex gap-1.5 mt-auto">
              <button
                onClick={() => handleSoldout(group.groupName)}
                disabled={isPending}
                className="flex-1 py-2 rounded-xl text-3xl font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50"
              >
                품절
              </button>
              <button
                onClick={() => handleActive(group.groupName)}
                disabled={isPending}
                className="flex-1 py-2 rounded-xl text-3xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
              >
                해제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 화면 로딩 오버레이 */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-lg font-medium">처리 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}