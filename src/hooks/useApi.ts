import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/api';
import * as session from '../lib/sessionCache';
import type { MenuGroups, ServiceKey, ShopInfoResponse } from '../types';

/** 백엔드 메모리 캐시와 같은 수명. 갱신 탈출구는 "메뉴 다시 불러오기" 버튼 하나다. */
const MENU_TTL = 24 * 60 * 60 * 1000;
const SHOP_INFO_PREFIX = 'shopInfo:';

/**
 * 메뉴/옵션 목록은 브라우저 세션에도 남긴다.
 *
 * React Query 캐시는 새로고침하면 사라져서 매번 다시 조회했고, 그 요청이 플랫폼
 * 로그인 확인까지 태워 오래 걸렸다. initialDataUpdatedAt에 기록 시각을 넘겨야
 * React Query가 "이미 신선한 값"으로 보고 재조회하지 않는다.
 */
export function useShopInfo(services: ServiceKey[]) {
  const cacheKey = SHOP_INFO_PREFIX + services.join(',');
  const cached = session.read<ShopInfoResponse>(cacheKey);

  return useQuery({
    queryKey: ['shopInfo', services],
    queryFn: async () => {
      const data = await api.fetchShopInfo(services);
      session.write(cacheKey, data);
      return data;
    },
    staleTime: MENU_TTL,
    ...(cached && { initialData: cached.value, initialDataUpdatedAt: cached.at }),
  });
}

export function useMenuGroups() {
  return useQuery({
    queryKey: ['menuGroups'],
    queryFn: api.fetchMenuGroups,
    staleTime: 60 * 1000,
  });
}

export function useSaveMenuGroups() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groups: MenuGroups) => api.saveMenuGroups(groups),
    onSuccess: (_d, groups) => qc.setQueryData(['menuGroups'], groups),
  });
}

/** 플랫폼에서 메뉴를 새로 긁어온다 (서버 캐시 + 세션 캐시를 비우고 재조회) */
export function useRefreshMenus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (service?: ServiceKey) => api.clearCache(service),
    onSuccess: () => {
      session.clear(SHOP_INFO_PREFIX);
      qc.invalidateQueries({ queryKey: ['shopInfo'] });
    },
  });
}

export const useSoldout = () => useMutation({ mutationFn: api.soldout });
export const useActivate = () => useMutation({ mutationFn: api.activate });
export const usePause = () => useMutation({ mutationFn: api.pauseStore });
export const useRelease = () => useMutation({ mutationFn: api.releaseStore });

export function useSchedules() {
  return useQuery({ queryKey: ['schedules'], queryFn: api.fetchSchedules });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}

export function useRunSchedules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.runSchedules,
    // 만료 처리가 함께 일어나므로 목록을 다시 읽는다
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}
