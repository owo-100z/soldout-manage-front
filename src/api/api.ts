import client from './client';
import type { ServiceKey } from '../types';

export const fetchShopInfo = (services: ServiceKey[]) =>
  client.post('/api/menu/shop-info', { services }).then((r) => r.data);

export const refreshMenus = (service?: ServiceKey) =>
  client.get('/api/menu/init-cache', { params: { service } }).then((r) => r.data);

export const soldoutMenus = (payload: {
  services: ServiceKey[];
  menuList: Record<ServiceKey, string[]>;
  optionList: Record<ServiceKey, string[]>;
  restockedAt?: string;
}) => client.post('/api/soldout', payload).then((r) => r.data);

export const activeMenus = (payload: {
  services: ServiceKey[];
  menuList: Record<ServiceKey, string[]>;
  optionList: Record<ServiceKey, string[]>;
}) => client.post('/api/soldout/active', payload).then((r) => r.data);

export const pauseStore = (payload: {
  services: ServiceKey[];
  from?: string;
  to: string;
}) => client.post('/api/pause', payload).then((r) => r.data);

export const releaseStore = (services: ServiceKey[]) =>
  client.post('/api/pause/release', { services }).then((r) => r.data);

export const fetchSettings = () =>
  client.get('/api/settings').then((r) => r.data);

export const saveSettings = (settings: Record<string, unknown>) =>
  client.post('/api/settings', { settings }).then((r) => r.data);

// 메뉴 그룹 관련 API
export const fetchMenuGroups = () =>
  client.get('/api/settings', { params: { key: 'menuGroups' } }).then((r) => r.data);

export const saveMenuGroups = (groups: unknown) =>
  client.post('/api/settings', { key: 'menuGroups', value: groups }).then((r) => r.data);