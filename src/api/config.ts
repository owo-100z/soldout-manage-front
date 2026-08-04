declare global {
  interface Window {
    API_URL?: string;
  }
}

/** 원격 설정을 못 읽었을 때 쓸 주소. 로컬 개발용이기도 하다. */
const DEFAULT = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 요청 직전마다 호출된다. 항상 최신 window.API_URL을 본다.
 * 백엔드가 cloudflared 퀵터널이라 재시작마다 주소가 바뀌기 때문이다.
 */
export const getApiUrl = () => window.API_URL || DEFAULT;

/**
 * 부팅 시 1회. 원격 config.json에서 주소를 받아 window에 심는다.
 * 형식: { "API_URL": "https://xxx.trycloudflare.com" }
 *
 * 실패해도 앱은 기본 주소로 계속 진행한다 — 화면이 안 뜨는 것보다 낫다.
 */
export async function loadApiUrl(): Promise<void> {
  const configUrl = import.meta.env.VITE_CONFIG_URL;

  if (!configUrl) {
    // 구 버전은 여기서 조용히 상수로 되돌아가 배포본이 localhost를 바라봤다. 눈에 보이게 남긴다.
    console.info('[api] VITE_CONFIG_URL 없음 — 기본 주소 사용:', DEFAULT);
    window.API_URL = DEFAULT;
    return;
  }

  try {
    // 캐시 무력화 필수: CDN이 옛 config를 주면 이 구조 자체가 무의미해진다
    const res = await fetch(`${configUrl}?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const config: { API_URL?: string } = await res.json();
    if (!config.API_URL) throw new Error('config.json에 API_URL이 없습니다');

    window.API_URL = config.API_URL;
    console.info('[api] 원격 설정 적용:', config.API_URL);
  } catch (e) {
    console.error('[api] 원격 설정 실패 — 기본 주소로 대체:', DEFAULT, e);
    window.API_URL = DEFAULT;
  }
}
