import dayjs, { type Dayjs } from 'dayjs';

/**
 * 날짜와 시/분을 합친다.
 *
 * 구 DateTimePicker는 마운트 effect가 시/분을 11:00으로 하드코딩해두고
 * 확인 버튼에서 그 값으로 시각을 조립했다. 그래서 날짜 선택기로 무엇을 고르든
 * 항상 11:00이 전송됐다. 조립 로직을 순수 함수로 떼어내 테스트한다.
 */
export function combine(date: Dayjs, hour: number, minute: number): Dayjs {
  return date.hour(hour).minute(minute).second(0).millisecond(0);
}

/** 백엔드가 받는 형식 */
export function toApiFormat(d: Dayjs): string {
  return d.format('YYYYMMDDHHmm');
}

export function formatLabel(d: Dayjs): string {
  return d.format('M월 D일 HH:mm');
}

/** 셀렉트 옵션과 값 비교가 어긋나지 않도록 항상 2자리 문자열로 다룬다. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export const HOURS = Array.from({ length: 24 }, (_, h) => pad2(h));
export const MINUTES = ['00', '10', '20', '30', '40', '50'];

/** 지금부터 mins분 뒤 (분 단위 내림 없이 그대로) */
export function fromNow(mins: number): Dayjs {
  return fromBase(dayjs(), mins);
}

/** 기준일(시)부터 mins분 뒤 */
export function fromBase(base: Dayjs, mins: number): Dayjs {
  return base.add(mins, 'minute').second(0).millisecond(0);
}