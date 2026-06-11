export type ServiceKey = 'baemin' | 'coupang' | 'ddangyo' | 'yogiyo';

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  baemin: '배민',
  coupang: '쿠팡',
  ddangyo: '땡겨요',
  yogiyo: '요기요',
};

export const ALL_SERVICES: ServiceKey[] = ['baemin', 'coupang', 'ddangyo', 'yogiyo'];

export interface MenuItem {
  id: string;
  name: string;
}

export interface OptionItem {
  id: string;
  name: string;
  groupName?: string;
}

export interface MenuListData {
  menuList: MenuItem[];
  optionList: OptionItem[];
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SavedMenu {
  service: ServiceKey; // 어느 플랫폼의 메뉴/옵션인지
  id: string;
  name: string;
  type: 'menu' | 'option';
}

// 서비스별 저장된 메뉴 그룹 (메뉴와 옵션 구분)
// { baemin: { "그룹명": { menu: [menuId1, ...], option: [optionId1, ...] } }, coupang: { ... } }
export interface ServiceMenuGroups {
  [service: string]: {
    [groupName: string]: {
      menu: string[];    // 메뉴 ID 배열
      option: string[];  // 옵션 ID 배열
    };
  };
}

// 레거시: 그룹 단위 저장 (사용하지 않음)
export interface MenuGroup {
  id: string;         // uuid
  name: string;       // 그룹 이름 (직접 입력)
  items: SavedMenu[]; // 메뉴/옵션 목록 (중복 가능)
}