import { afterEach, describe, expect, it, vi } from 'vitest';
import { clear, read, write } from './sessionCache';

// jsdom 없이 node 환경에서 돌린다. Map 하나로 sessionStorage를 흉내낸다.
function stubStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  // Object.keys(sessionStorage)가 키를 돌려줘야 clear가 동작한다
  vi.stubGlobal(
    'sessionStorage',
    new Proxy(storage, {
      ownKeys: () => [...store.keys()],
      getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    })
  );
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe('sessionCache', () => {
  it('쓴 값을 기록 시각과 함께 읽는다', () => {
    stubStorage();
    write('shopInfo:baemin', { menuList: [1, 2] });

    const entry = read<{ menuList: number[] }>('shopInfo:baemin');
    expect(entry?.value).toEqual({ menuList: [1, 2] });
    expect(entry?.at).toBeGreaterThan(0);
  });

  it('없는 키는 null', () => {
    stubStorage();
    expect(read('없음')).toBeNull();
  });

  it('깨진 JSON은 null (예외를 던지지 않는다)', () => {
    const store = stubStorage();
    store.set('shopInfo:baemin', '{망가진');
    expect(read('shopInfo:baemin')).toBeNull();
  });

  it('prefix로 시작하는 키만 지운다', () => {
    stubStorage();
    write('shopInfo:baemin', 1);
    write('shopInfo:coupang', 2);
    write('remoteToken', 'abc');

    clear('shopInfo:');

    expect(read('shopInfo:baemin')).toBeNull();
    expect(read('shopInfo:coupang')).toBeNull();
    expect(read('remoteToken')?.value).toBe('abc');
  });

  it('저장소 접근이 막혀도(시크릿 모드) 던지지 않는다', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('접근 거부');
      },
      setItem: () => {
        throw new Error('접근 거부');
      },
    });

    expect(() => write('k', 1)).not.toThrow();
    expect(read('k')).toBeNull();
    expect(() => clear('k')).not.toThrow();
  });
});
