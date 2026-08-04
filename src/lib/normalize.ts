import type { MenuItem, ServiceKey } from '../types';

/** 플랫폼마다 다른 필드명을 { id, name }으로 통일한다. */
const FIELDS: Record<ServiceKey, { menuId: string; menuName: string; optionId: string; optionName: string }> = {
  baemin: { menuId: 'menuId', menuName: 'menuName', optionId: 'optionId', optionName: 'optionName' },
  coupang: { menuId: 'dishId', menuName: 'dishName', optionId: 'optionItemId', optionName: 'optionItemName' },
  ddangyo: { menuId: 'menu_id', menuName: 'menu_nm', optionId: 'optn_id', optionName: 'optn_nm' },
  yogiyo: { menuId: 'product_id', menuName: 'name', optionId: 'option_id', optionName: 'name' },
};

function pick(raw: unknown[] | undefined, idKey: string, nameKey: string): MenuItem[] {
  const seen = new Map<string, MenuItem>();

  for (const entry of raw ?? []) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;

    const id = item[idKey] == null ? '' : String(item[idKey]);
    const name = item[nameKey] == null ? '' : String(item[nameKey]);
    // 같은 ID가 여러 번 나올 수 있다 (쿠팡은 메뉴 그룹마다 같은 요리가 중복)
    if (id && name && !seen.has(id)) seen.set(id, { id, name });
  }

  return [...seen.values()];
}

export function normalizeMenus(service: ServiceKey, raw: unknown[] | undefined): MenuItem[] {
  const f = FIELDS[service];
  return pick(raw, f.menuId, f.menuName);
}

export function normalizeOptions(service: ServiceKey, raw: unknown[] | undefined): MenuItem[] {
  const f = FIELDS[service];
  return pick(raw, f.optionId, f.optionName);
}
