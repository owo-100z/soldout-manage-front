/**
 * sessionStorage에 값 + 기록 시각을 담는 얇은 래퍼.
 *
 * 새로고침할 때마다 메뉴를 다시 긁어오면 플랫폼 로그인 확인까지 다시 타서 오래 걸린다.
 * 백엔드도 24시간 캐시를 갖고 있으므로, 여기서는 왕복 자체를 없앤다.
 * 시크릿 모드·용량 초과에서 sessionStorage 접근이 throw 하므로 전부 감싼다.
 */

type Entry<T> = { at: number; value: T };

export function read<T>(key: string): Entry<T> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Entry<T>;
    return typeof parsed?.at === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

export function write<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), value } satisfies Entry<T>));
  } catch {
    /* 저장 못 해도 동작에는 지장이 없다 — 다음 요청 때 서버에서 받는다 */
  }
}

/** prefix로 시작하는 키를 모두 지운다 (플랫폼별 키가 여러 개다) */
export function clear(prefix: string): void {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* 위와 같다 */
  }
}
