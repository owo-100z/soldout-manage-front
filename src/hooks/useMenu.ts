import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activeMenus, fetchShopInfo, refreshMenus, soldoutMenus } from '../api/api';
import { ALL_SERVICES } from '../types';

// 항상 전체 서비스로 최초 1회만 조회
// services 변경은 queryKey에 포함하지 않음 → 서비스 선택 바꿔도 재호출 안 함
export function useShopInfo() {
  return useQuery({
    queryKey: ['shopInfo'],
    queryFn: () => fetchShopInfo(ALL_SERVICES),
    staleTime: Infinity, // 명시적 refetch 전까지 재호출 안 함
  });
}

export function useRefreshMenus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchShopInfo(ALL_SERVICES),
    onSuccess: (data) => {
      // 캐시 직접 업데이트
      queryClient.setQueryData(['shopInfo'], data);
    },
  });
}

export function useInitCacheAndRefresh() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => refreshMenus(), // 백엔드 캐시 초기화 후 재조회
    onSuccess: async () => {
      const data = await fetchShopInfo(ALL_SERVICES);
      queryClient.setQueryData(['shopInfo'], data);
    },
  });
}

interface SoldoutPayload {
  services: import('../types').ServiceKey[];
  menuList: Record<import('../types').ServiceKey, string[]>;
  optionList: Record<import('../types').ServiceKey, string[]>;
  restockedAt?: string;
}

interface ApiResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

function getServiceLabel(service: string): string {
  const labels: Record<string, string> = {
    baemin: '배민',
    coupang: '쿠팡',
    ddangyo: '땡겨요',
    yogiyo: '요기요',
  };
  return labels[service] || service;
}

function showResultAlert(results: Record<string, ApiResult>, soldout: boolean = false): void {
  const failedServices: string[] = [];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const [service, result] of Object.entries(results)) {
    if (result.success) {
      totalSuccess++;
    } else {
      totalFailed++;
      failedServices.push(getServiceLabel(service));
    }
  }

  if (totalFailed === 0) {
    alert(`선택한 메뉴 품절이 ${soldout ? '설정' : '해제'}되었습니다.`);
  } else {
    alert(`선택한 메뉴 품절이 ${soldout ? '설정' : '해제'}되었습니다.\n실패한 서비스: [${failedServices.join(', ')}]`);
  }
}

export function useSoldout(options?: {
  onSuccess?: (results: Record<string, ApiResult>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (payload: SoldoutPayload) => soldoutMenus(payload),
    onSuccess: (data: { data?: Record<string, ApiResult> }) => {
      const results = data?.data || {};
      showResultAlert(results, true);
      options?.onSuccess?.(results);
    },
    onError: (error: Error) => {
      alert(`오류 발생: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

export function useActive(options?: {
  onSuccess?: (results: Record<string, ApiResult>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (payload: Omit<SoldoutPayload, 'restockedAt'>) => activeMenus(payload),
    onSuccess: (data: { data?: Record<string, ApiResult> }) => {
      const results = data?.data || {};
      showResultAlert(results);
      options?.onSuccess?.(results);
    },
    onError: (error: Error) => {
      alert(`오류 발생: ${error.message}`);
      options?.onError?.(error);
    },
  });
}