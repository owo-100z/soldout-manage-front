import { describe, it, expect } from 'vitest';
import { normalizeMenus, normalizeOptions } from './normalize';

describe('normalizeMenus', () => {
  it('플랫폼마다 다른 필드명을 id/name으로 통일한다', () => {
    expect(normalizeMenus('baemin', [{ menuId: 1, menuName: '김밥' }])).toEqual([
      { id: '1', name: '김밥' },
    ]);
    expect(normalizeMenus('coupang', [{ dishId: 'D1', dishName: '라면' }])).toEqual([
      { id: 'D1', name: '라면' },
    ]);
    expect(normalizeMenus('ddangyo', [{ menu_id: 'M1', menu_nm: '떡볶이' }])).toEqual([
      { id: 'M1', name: '떡볶이' },
    ]);
    expect(normalizeMenus('yogiyo', [{ product_id: 9, name: '순대' }])).toEqual([
      { id: '9', name: '순대' },
    ]);
  });

  it('중복 ID를 하나로 합친다', () => {
    const items = [
      { dishId: 'D1', dishName: '라면' },
      { dishId: 'D1', dishName: '라면' },
    ];
    expect(normalizeMenus('coupang', items)).toHaveLength(1);
  });

  it('id나 name이 없는 항목은 버린다', () => {
    expect(normalizeMenus('baemin', [{ menuId: 1 }, { menuName: '이름만' }, null, 'x'])).toEqual([]);
  });

  it('undefined 입력에도 던지지 않는다', () => {
    expect(normalizeMenus('baemin', undefined)).toEqual([]);
  });
});

describe('normalizeOptions', () => {
  it('옵션 필드도 통일한다', () => {
    expect(normalizeOptions('baemin', [{ optionId: 7, optionName: '곱빼기' }])).toEqual([
      { id: '7', name: '곱빼기' },
    ]);
    expect(normalizeOptions('coupang', [{ optionItemId: 'O1', optionItemName: '치즈' }])).toEqual([
      { id: 'O1', name: '치즈' },
    ]);
    expect(normalizeOptions('ddangyo', [{ optn_id: 'P1', optn_nm: '계란' }])).toEqual([
      { id: 'P1', name: '계란' },
    ]);
    expect(normalizeOptions('yogiyo', [{ option_id: 3, name: '공기밥' }])).toEqual([
      { id: '3', name: '공기밥' },
    ]);
  });
});
