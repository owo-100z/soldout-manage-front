import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ServiceSelector from '../components/ServiceSelector';
import PauseControl from '../components/PauseControl';
import MenuGrid from '../components/MenuGrid';
import { useShopInfo } from '../hooks/useMenu';
import { ALL_SERVICES, type ServiceKey, type ServiceMenuGroups } from '../types';
import { normalizeMenuData } from '../utils/normalize';
import { fetchMenuGroups } from '../api/api';

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<ServiceKey[]>([...ALL_SERVICES]);

  // 최초 1회 조회 (서비스 선택 변경해도 재호출 안 함)
  const { data, isLoading, isError, refetch } = useShopInfo();

  // 백엔드에서 그룹 정보 조회
  const { data: groupsData } = useQuery({
    queryKey: ['menuGroups'],
    queryFn: fetchMenuGroups,
    staleTime: Infinity,
  });

  // 로컬 스토리지에서 초기값 가져오기 (백엔드 데이터가 없을 때)
  const localGroups: ServiceMenuGroups = JSON.parse(localStorage.getItem('menuGroups') || '{}');

  // 전체 그룹 데이터 (로컬 + 백엔드 병합)
  const groupsDataParsed = useMemo(() => {
    if (groupsData?.data?.menuGroups) {
      return groupsData.data.menuGroups;
    }
    return {};
  }, [groupsData]);

  const allGroups = useMemo(() => {
    return { ...localGroups, ...groupsDataParsed };
  }, [localGroups, groupsDataParsed]);

  // 전체 서비스 메뉴 정규화 (메인 페이지에서는 사용하지 않음 - MenuGrid가 groups 사용)
  // 이 데이터는 나중에 필요할 수 있으므로 유지
  const allServicesData = data?.data || {};
  for (const service of ALL_SERVICES) {
    const serviceData = allServicesData[service];
    normalizeMenuData(service, serviceData);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-zinc-900">품절 관리</h1>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="설정"
        >
          <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 서비스 선택 - 선택 변경은 품절/해제 호출 시에만 영향 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">서비스 선택</p>
          <ServiceSelector selected={selectedServices} onChange={setSelectedServices} />
        </section>

        {/* 임시중지 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">임시중지</p>
          <PauseControl selectedServices={selectedServices} />
        </section>

        {/* 메뉴 그룹 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">메뉴</p>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? '로딩 중...' : '↻ 새로고침'}
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
              <p className="text-base text-zinc-400 mt-2">메뉴 불러오는 중...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-base text-red-500">메뉴를 불러오지 못했습니다.</p>
              <button onClick={() => refetch()} className="mt-2 text-sm text-zinc-500 underline">
                다시 시도
              </button>
            </div>
          ) : (
            <MenuGrid
              selectedServices={selectedServices}
              groups={allGroups}
            />
          )}
        </section>
      </div>
    </div>
  );
}