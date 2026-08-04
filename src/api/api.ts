import client from './client';
import type {
  MenuGroups,
  RunResponse,
  Schedule,
  ServiceKey,
  ShopInfoResponse,
} from '../types';

type IdMap = Partial<Record<ServiceKey, string[]>>;

export const fetchShopInfo = (services: ServiceKey[]) =>
  client.post<ShopInfoResponse>('/api/menu/shop-info', { services }).then((r) => r.data);

export const clearCache = (service?: ServiceKey) =>
  client.get('/api/menu/init-cache', { params: { service } }).then((r) => r.data);

export const soldout = (payload: {
  services: ServiceKey[];
  menuList: IdMap;
  optionList: IdMap;
}) => client.post<RunResponse>('/api/soldout', payload).then((r) => r.data);

export const activate = (payload: {
  services: ServiceKey[];
  menuList: IdMap;
  optionList: IdMap;
}) => client.post<RunResponse>('/api/soldout/active', payload).then((r) => r.data);

export const pauseStore = (payload: { services: ServiceKey[]; to: string }) =>
  client.post<RunResponse>('/api/pause', payload).then((r) => r.data);

export const releaseStore = (services: ServiceKey[]) =>
  client.post<RunResponse>('/api/pause/release', { services }).then((r) => r.data);

export const fetchMenuGroups = () =>
  client
    .get<{ ok: boolean; value: MenuGroups | null }>('/api/settings', {
      params: { key: 'menuGroups' },
    })
    .then((r) => r.data.value ?? {});

export const saveMenuGroups = (value: MenuGroups) =>
  client.post('/api/settings', { key: 'menuGroups', value }).then((r) => r.data);

export const fetchSchedules = () =>
  client
    .get<{ ok: boolean; schedules: Schedule[] }>('/api/schedule')
    .then((r) => r.data.schedules);

export const createSchedule = (payload: {
  groups: string[];
  services: ServiceKey[];
  endDate: string;
}) => client.post('/api/schedule', payload).then((r) => r.data);

/** 오픈 시각을 기다리지 않고 지금 실행 — cron이 부르는 것과 같은 동작 */
export const runSchedules = () =>
  client.post<RunResponse & { note?: string }>('/api/schedule/run').then((r) => r.data);

export const deleteSchedule = (id: number) =>
  client.delete(`/api/schedule/${id}`).then((r) => r.data);

// ── 원격 브라우저 화면 (캡챠 로그인) ──────────────────────────
//
// 토큰은 화면에서 입력받아 sessionStorage에만 둔다. 백엔드에 REMOTE_TOKEN이
// 설정돼 있을 때만 검사하므로, 비어 있으면 그냥 헤더 없이 나간다.

const TOKEN_KEY = 'remoteToken';

export const getRemoteToken = () => sessionStorage.getItem(TOKEN_KEY) ?? '';
export const setRemoteToken = (v: string) => sessionStorage.setItem(TOKEN_KEY, v);

const remoteHeaders = () => {
  const token = getRemoteToken();
  return token ? { 'x-remote-token': token } : undefined;
};

/** 어느 칸에 무엇이 들어갔는지 — 조작이 헛돌 때 이게 유일한 단서다 */
export type RemoteState = {
  ok: boolean;
  error?: string;
  url?: string;
  viewport?: { width: number; height: number };
  focus?: { target: string; type: string | null; readOnly: boolean; value: string | null } | null;
  filled?: Record<string, { found: boolean; target?: string; after?: string; usedFallback?: boolean }>;
};

const remote = (service: ServiceKey, action: string, body?: unknown) =>
  client
    .post<RemoteState>(`/api/remote/${service}/${action}`, body ?? {}, {
      headers: remoteHeaders(),
    })
    .then((r) => r.data);

export const remoteStart = (service: ServiceKey) => remote(service, 'start');
export const remoteFinish = (service: ServiceKey) => remote(service, 'finish');
export const remoteCancel = (service: ServiceKey) => remote(service, 'cancel');
export const remoteFill = (service: ServiceKey, captcha: string) =>
  remote(service, 'fill', { captcha });
export const remoteSubmit = (service: ServiceKey) => remote(service, 'submit');
export const remoteClick = (service: ServiceKey, x: number, y: number) =>
  remote(service, 'click', { x, y });
export const remoteType = (service: ServiceKey, text: string) => remote(service, 'type', { text });
export const remoteKey = (service: ServiceKey, key: string) => remote(service, 'key', { key });

/** 화면 이미지는 <img src>로 직접 받는다. 토큰이 필요하면 blob으로 받아 objectURL을 만든다. */
export const remoteScreen = (service: ServiceKey) =>
  client
    .get<Blob>(`/api/remote/${service}/screen`, {
      responseType: 'blob',
      headers: remoteHeaders(),
    })
    .then((r) => URL.createObjectURL(r.data));
