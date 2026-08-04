export type ServiceKey = 'baemin' | 'coupang' | 'ddangyo' | 'yogiyo';

export const ALL_SERVICES: ServiceKey[] = ['baemin', 'coupang', 'ddangyo', 'yogiyo'];

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  baemin: '배민',
  coupang: '쿠팡이츠',
  ddangyo: '땡겨요',
  yogiyo: '요기요',
};

/** 처리 건수 집계. skipped는 "대상이 없어 호출하지 않음" — 성공과 구분된다. */
export interface Tally {
  total: number;
  succeeded: number;
  failed: number;
  skipped?: boolean;
  errors?: string[];
}

/** 어느 단계에서 실패했는지 */
export type Stage = 'login' | 'execute' | 'context';

export interface ServiceResult {
  ok: boolean;
  stage?: Stage;
  error?: string;
  /** 임시중지/해제는 건수를 세지 않는다. 성공을 이 필드로 표현한다. */
  action?: 'pause' | 'release';
  menu?: Tally;
  option?: Tally;
  missing?: string[];
  alreadyReleased?: boolean;
}

/** 플랫폼별 결과를 담는 백엔드 공통 응답 */
export interface RunResponse {
  ok: boolean;
  results: Partial<Record<ServiceKey, ServiceResult>>;
}

export interface MenuItem {
  id: string;
  name: string;
}

export interface ShopData extends ServiceResult {
  shopInfo?: Record<string, unknown>;
  menuList?: unknown[];
  optionList?: unknown[];
}

export interface ShopInfoResponse {
  ok: boolean;
  results: Partial<Record<ServiceKey, ShopData>>;
}

/** { baemin: { "돈까스류": { menu: [...], option: [...] } } } */
export type MenuGroups = Partial<
  Record<ServiceKey, Record<string, { menu: string[]; option: string[] }>>
>;

/** 예약 단위는 메뉴가 아니라 메뉴 그룹이다 (메인화면 품절 버튼과 같은 단위) */
export interface Schedule {
  id: number;
  groups: string[];
  services: ServiceKey[];
  end_date: string;
  status: string;
  created_at: string;
}
