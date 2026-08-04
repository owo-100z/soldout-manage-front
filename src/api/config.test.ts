import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiUrl, loadApiUrl } from './config';

// 기본 주소는 .env의 VITE_API_URL에 따라 달라지므로 모듈에서 직접 얻는다.
// (상수로 박아두면 로컬 .env 값에 따라 테스트가 깨진다)
vi.stubGlobal('window', {});
const DEFAULT = getApiUrl();
vi.unstubAllGlobals();

// jsdom 없이 node 환경에서 돌린다. window/fetch만 흉내내면 충분하다.
function stubWindow() {
  const win = {} as Window & typeof globalThis;
  vi.stubGlobal('window', win);
  return win;
}

function stubFetch(impl: () => unknown) {
  vi.stubGlobal('fetch', vi.fn(impl));
}

const ok = (body: unknown) => ({ ok: true, json: async () => body });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('getApiUrl', () => {
  it('window.API_URL의 변경을 즉시 반영한다', () => {
    // 인터셉터가 매 요청마다 최신 값을 읽는다는 보장
    const win = stubWindow();
    expect(getApiUrl()).toBe(DEFAULT);

    win.API_URL = 'https://a.trycloudflare.com';
    expect(getApiUrl()).toBe('https://a.trycloudflare.com');

    win.API_URL = 'https://b.trycloudflare.com';
    expect(getApiUrl()).toBe('https://b.trycloudflare.com');
  });
});

describe('loadApiUrl', () => {
  it('VITE_CONFIG_URL이 없으면 fetch 없이 기본값', async () => {
    vi.stubEnv('VITE_CONFIG_URL', ''); // 로컬 .env에 값이 있어도 이 테스트는 없는 경우를 본다
    const win = stubWindow();
    stubFetch(() => {
      throw new Error('호출되면 안 된다');
    });

    await loadApiUrl();

    expect(win.API_URL).toBe(DEFAULT);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('원격 config를 읽어 window에 심는다 (캐시 무력화 포함)', async () => {
    vi.stubEnv('VITE_CONFIG_URL', 'https://example.com/config.json');
    const win = stubWindow();
    stubFetch(() => ok({ API_URL: 'https://tunnel.trycloudflare.com' }));

    await loadApiUrl();

    expect(win.API_URL).toBe('https://tunnel.trycloudflare.com');
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toMatch(/^https:\/\/example\.com\/config\.json\?v=\d+$/);
    expect(init).toEqual({ cache: 'no-store' });
  });

  it('fetch가 실패해도 기본값으로 계속 진행한다', async () => {
    vi.stubEnv('VITE_CONFIG_URL', 'https://example.com/config.json');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const win = stubWindow();
    stubFetch(() => Promise.reject(new Error('네트워크 없음')));

    await expect(loadApiUrl()).resolves.toBeUndefined();
    expect(win.API_URL).toBe(DEFAULT);
  });

  it('404(Gist 삭제 등)면 기본값', async () => {
    vi.stubEnv('VITE_CONFIG_URL', 'https://example.com/config.json');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const win = stubWindow();
    stubFetch(() => ({ ok: false, status: 404, json: async () => ({}) }));

    await loadApiUrl();
    expect(win.API_URL).toBe(DEFAULT);
  });

  it('config에 API_URL이 없으면 기본값', async () => {
    vi.stubEnv('VITE_CONFIG_URL', 'https://example.com/config.json');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const win = stubWindow();
    stubFetch(() => ok({ note: '오타로 키가 빠진 경우' }));

    await loadApiUrl();
    expect(win.API_URL).toBe(DEFAULT);
  });
});
