import type { MenuItem, OptionItem, ServiceKey } from '../types';

/**
 * 백엔드 응답 데이터를 프론트에서 사용할 수 있는 형태로 정규화
 * 각 플랫폼(배민, 쿠팡,땡겨요, 요기요)의 데이터를 공통 형식으로 변환
 */
export function normalizeMenuData(service: ServiceKey, rawData: any): {
  menuList: MenuItem[];
  optionList: OptionItem[];
} {
  if (!rawData?.data?.menuList) {
    return { menuList: [], optionList: [] };
  }

  const menuListRaw = rawData.data.menuList.menuList ?? [];
  const optionListRaw = rawData.data.menuList.optionList ?? [];

  return {
    menuList: normalizeMenuItems(service, menuListRaw),
    optionList: normalizeOptionItems(service, optionListRaw),
  };
}

/**
 * 메뉴 데이터 정규화
 * 플랫폼별 다른 필드명을 공통 id, name으로 변환
 */
function normalizeMenuItems(service: ServiceKey, items: any[]): MenuItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  const normalized = items.map((item) => {
    const id = getMenuId(service, item);
    const name = getMenuName(service, item);
    return { id, name };
  });

  // 중복 제거 (같은 ID의 메뉴가 여러 번 나타날 수 있음)
  // 쿠팡의 경우 menuId가 중복되므로 dishId도 함께 고려
  const uniqueMap = new Map<string, MenuItem>();
  normalized.forEach((item) => {
    if (!uniqueMap.has(item.id) && item.id && item.name) {
      uniqueMap.set(item.id, item);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * 옵션 데이터 정규화
 */
function normalizeOptionItems(service: ServiceKey, items: any[]): OptionItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  const normalized = items.map((item) => {
    const id = getOptionId(service, item);
    const name = getOptionName(service, item);
    const groupName = getOptionGroupName(service, item);
    return { id, name, groupName };
  });

  // 중복 제거 (같은 ID의 옵션이 여러 번 나타날 수 있음)
  const uniqueMap = new Map<string, OptionItem>();
  normalized.forEach((item) => {
    if (!uniqueMap.has(item.id) && item.id && item.name) {
      uniqueMap.set(item.id, item);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * 플랫폼별 메뉴 ID 추출
 */
function getMenuId(service: ServiceKey, item: any): string {
  switch (service) {
    case 'baemin':
      return String(item.menuId ?? '');
    case 'coupang':
      return String(item.dishId ?? '');
    case 'ddangyo':
      return String(item.menu_id ?? '');
    case 'yogiyo':
      return String(item.product_id ?? '');
    default:
      return String(item.id ?? item.menuId ?? '');
  }
}

/**
 * 플랫폼별 메뉴 이름 추출
 */
function getMenuName(service: ServiceKey, item: any): string {
  switch (service) {
    case 'baemin':
      return item.menuName ?? '';
    case 'coupang':
      return item.dishName ?? '';
    case 'ddangyo':
      return item.menu_nm ?? '';
    case 'yogiyo':
      return item.name ?? '';
    default:
      return item.name ?? '';
  }
}

/**
 * 플랫폼별 옵션 ID 추출
 */
function getOptionId(service: ServiceKey, item: any): string {
  switch (service) {
    case 'baemin':
      return String(item.optionId ?? '');
    case 'coupang':
      return String(item.optionItemId ?? '');
    case 'ddangyo':
      return String(item.optn_id ?? '');
    case 'yogiyo':
      return String(item.option_id ?? '');
    default:
      return String(item.id ?? '');
  }
}

/**
 * 플랫폼별 옵션 이름 추출
 */
function getOptionName(service: ServiceKey, item: any): string {
  switch (service) {
    case 'baemin':
      return item.optionName ?? '';
    case 'coupang':
      return item.optionItemName ?? '';
    case 'ddangyo':
      return item.optn_nm ?? '';
    case 'yogiyo':
      return item.name ?? '';
    default:
      return item.name ?? '';
  }
}

/**
 * 플랫폼별 옵션 그룹 이름 추출
 */
function getOptionGroupName(service: ServiceKey, item: any): string | undefined {
  switch (service) {
    case 'baemin':
      // groupName 필드 사용
      return item.groupName;
    case 'coupang':
      // groupName 필드 사용
      return item.groupName;
    case 'ddangyo':
      // opt_grp_nm 또는 option_grp_nm 필드 사용
      return item.opt_grp_nm ?? item.option_grp_nm ?? item.groupName;
    case 'yogiyo':
      // option_group_name 필드 사용
      return item.option_group_name ?? item.groupName;
    default:
      return item.groupName;
  }
}