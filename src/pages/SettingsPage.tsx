import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import GroupManager from '../components/GroupManager';
import { useInitCacheAndRefresh, useShopInfo } from '../hooks/useMenu';
import { ALL_SERVICES, SERVICE_LABELS, type ServiceKey } from '../types';
import { normalizeMenuData } from '../utils/normalize';
import { fetchMenuGroups, saveMenuGroups } from '../api/api';

// 새로운 그룹 데이터 타입: { baemin: { "그룹명": { menu: [아이템ID, ...], option: [아이템ID, ...] } }, ... }
type GroupItemData = {
  menu: string[];
  option: string[];
};
type GroupDataByService = Record<ServiceKey, Record<string, GroupItemData>>;

export default function SettingsPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceKey>('baemin');
  const initAndRefresh = useInitCacheAndRefresh();

  // 공통 그룹 목록 (모든 서비스에서 공유)
  const [groupNames, setGroupNames] = useState<string[]>([]);

  // 서비스별 그룹 데이터: { baemin: { "그룹1": { menu: [...], option: [...] }, ... }, coupang: { ... } }
  const [groupDataByService, setGroupDataByService] = useState<GroupDataByService>({
    baemin: {},
    coupang: {},
    ddangyo: {},
    yogiyo: {},
  });

  const { data, isLoading } = useShopInfo();

  const { data: groupsData, refetch: refetchGroups } = useQuery({
    queryKey: ['menuGroups'],
    queryFn: fetchMenuGroups,
    staleTime: Infinity,
  });

  // 로컬 스토리지에서 데이터 로드 (기존 데이터를 새 형식으로 변환)
  useEffect(() => {
    const savedData = localStorage.getItem('menuGroups');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // groupNames 추출
        const allGroupNames = new Set<string>();
        const newGroupDataByService: GroupDataByService = {
          baemin: {},
          coupang: {},
          ddangyo: {},
          yogiyo: {},
        };

        ALL_SERVICES.forEach(service => {
          const serviceData = parsed[service] || {};
          Object.keys(serviceData).forEach(groupName => {
            allGroupNames.add(groupName);
            const oldData = serviceData[groupName];
            // 기존 데이터 형식인지 새 데이터 형식인지 확인
            if (Array.isArray(oldData)) {
              // 기존: { "그룹명": [아이템ID, ...] } -> 새: { "그룹명": { menu: [...], option: [] } }
              newGroupDataByService[service][groupName] = { menu: oldData, option: [] };
            } else if (oldData && typeof oldData === 'object') {
              // 새 형식: { menu: [...], option: [...] }
              newGroupDataByService[service][groupName] = oldData;
            } else {
              // 빈 데이터
              newGroupDataByService[service][groupName] = { menu: [], option: [] };
            }
          });
        });

        setGroupNames(Array.from(allGroupNames));
        setGroupDataByService(newGroupDataByService);
      } catch (e) {
        console.error('Failed to parse menuGroups from localStorage:', e);
      }
    }
  }, []);

  // 백엔드에서 가져온 데이터
  const groupsDataParsed = useMemo(() => {
    if (groupsData?.data?.menuGroups) {
      return groupsData.data.menuGroups;
    }
    return {};
  }, [groupsData]);

  const serviceData = (data?.data as any)?.[selectedService];
  const normalized = serviceData ? normalizeMenuData(selectedService, serviceData) : { menuList: [], optionList: [] };
  const menuList = normalized.menuList;
  const optionList = normalized.optionList;

  // 현재 서비스의 그룹 데이터 (편집 상태 + 백엔드 데이터 병합)
  const currentServiceData = groupDataByService[selectedService] || {};

  const saveMutation = useMutation({
    mutationFn: saveMenuGroups,
    onSuccess: () => {
      alert('저장되었습니다.');
      refetchGroups();
    },
    onError: () => {
      alert('서버 저장 실패 - 로컬에 저장됩니다.');
    },
  });

  // 현재 서비스의 그룹 데이터만 저장
  const handleSaveGroups = (updatedGroupData: Record<string, GroupItemData>) => {
    // 현재 서비스의 데이터만 업데이트
    const newGroupDataByService: GroupDataByService = {
      ...groupDataByService,
      [selectedService]: updatedGroupData,
    };

    // localStorage에 전체 저장
    localStorage.setItem('menuGroups', JSON.stringify(newGroupDataByService));
    
    // 백엔드에 저장 (전체 데이터)
    saveMutation.mutate(JSON.stringify(newGroupDataByService));
  };

  // 그룹 추가 콜백
  const handleGroupAdded = (name: string) => {
    if (!groupNames.includes(name)) {
      setGroupNames(prev => [...prev, name]);
      // 새 그룹의 초기 데이터는 menu, option 빈 배열
      setGroupDataByService(prev => ({
        ...prev,
        [selectedService]: {
          ...prev[selectedService],
          [name]: { menu: [], option: [] },
        },
      }));
    }
  };

  // 현재 서비스의 데이터만 삭제 (그룹 라디오 버튼의 X 버튼)
  const handleGroupRemoved = (name: string) => {
    setGroupDataByService(prev => ({
      ...prev,
      [selectedService]: {
        ...prev[selectedService],
        [name]: { menu: [], option: [] },
      },
    }));
  };

  // 그룹 자체를 삭제 (모든 서비스에서) - "이 서비스에서 삭제" 버튼용
  const handleServiceDataRemoved = (name: string) => {
    // 모든 서비스에서 해당 그룹 데이터 제거
    setGroupDataByService(prev => {
      const newData = { ...prev };
      ALL_SERVICES.forEach(service => {
        if (newData[service][name]) {
          delete newData[service][name];
        }
      });
      return newData;
    });
    
    // groupNames에서도 제거
    const remainingNames = groupNames.filter(n => n !== name);
    setGroupNames(remainingNames);
  };

  // 아이템 토글 콜백 (메뉴/옵션 구분)
  const handleItemToggled = (groupName: string, itemId: string, itemType: 'menu' | 'option') => {
    const currentGroupData = currentServiceData[groupName] || { menu: [], option: [] };
    const currentItems = currentGroupData[itemType] || [];
    const exists = currentItems.includes(itemId);
    const newItems = exists
      ? currentItems.filter((id: string) => id !== itemId)
      : [...currentItems, itemId];

    setGroupDataByService(prev => ({
      ...prev,
      [selectedService]: {
        ...prev[selectedService],
        [groupName]: {
          ...currentGroupData,
          [itemType]: newItems,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="뒤로가기"
        >
          <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-zinc-900">설정</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 서비스 선택 - 라디오 단건 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">서비스 선택</p>
          <div className="flex gap-2 flex-wrap">
            {ALL_SERVICES.map((service) => (
              <button
                key={service}
                onClick={() => setSelectedService(service)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                  selectedService === service
                    ? 'bg-zinc-800 text-white border-zinc-800'
                    : 'bg-white text-zinc-500 border-zinc-300 hover:border-zinc-500'
                }`}
              >
                {SERVICE_LABELS[service]}
              </button>
            ))}
          </div>
        </section>

        {/* 그룹 관리 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">그룹 관리</p>
            <button
              onClick={() => initAndRefresh.mutate()}
              disabled={initAndRefresh.isPending || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-900 text-white transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${initAndRefresh.isPending ? 'animate-spin' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              불러오기
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
              <p className="text-sm text-zinc-400 mt-2">메뉴 불러오는 중...</p>
            </div>
          ) : (
            <GroupManager
              selectedService={selectedService}
              menuList={menuList}
              optionList={optionList}
              groupNames={groupNames}
              groupData={currentServiceData}
              onGroupAdded={handleGroupAdded}
              onGroupRemoved={handleGroupRemoved}
              onServiceDataRemoved={handleServiceDataRemoved}
              onItemToggled={handleItemToggled}
              onSave={handleSaveGroups}
            />
          )}
        </section>
      </div>
    </div>
  );
}
