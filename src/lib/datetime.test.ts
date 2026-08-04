import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { combine, toApiFormat, pad2, HOURS, MINUTES } from './datetime';

describe('combine', () => {
  it('고른 시각을 그대로 반영한다', () => {
    const date = dayjs('2026-08-03T00:00:00');
    expect(toApiFormat(combine(date, 14, 30))).toBe('202608031430');
  });

  it('11:00으로 고정되지 않는다', () => {
    // 구 버전의 P0 버그: 무엇을 골라도 11:00이 전송됐다
    const date = dayjs('2026-08-03T00:00:00');
    for (const [h, m] of [[9, 0], [14, 30], [23, 50]] as const) {
      expect(toApiFormat(combine(date, h, m))).toBe(`20260803${pad2(h)}${pad2(m)}`);
    }
  });

  it('초/밀리초를 0으로 만든다', () => {
    const d = combine(dayjs('2026-08-03T05:06:07.888'), 1, 2);
    expect(d.second()).toBe(0);
    expect(d.millisecond()).toBe(0);
  });
});

describe('셀렉트 옵션', () => {
  it('시/분 값이 옵션 문자열과 정확히 일치한다', () => {
    // 구 버전은 value={String(0)} → "0" 인데 옵션은 "00" 이라 매칭에 실패했다.
    // 그래서 30분을 골라도 화면에 반영되지 않았다.
    expect(HOURS).toContain(pad2(0));
    expect(HOURS).toContain(pad2(23));
    expect(MINUTES).toContain(pad2(0));
    expect(MINUTES).toContain(pad2(30));
    expect(pad2(0)).toBe('00');
    expect(pad2(30)).toBe('30');
  });

  it('시간은 24개, 분은 10분 단위', () => {
    expect(HOURS).toHaveLength(24);
    expect(MINUTES).toEqual(['00', '10', '20', '30', '40', '50']);
  });
});
