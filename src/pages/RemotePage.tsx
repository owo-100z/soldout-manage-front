import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import * as api from '../api/api';
import { ALL_SERVICES, SERVICE_LABELS, type ServiceKey } from '../types';

/**
 * 원격 브라우저 화면.
 *
 * 땡겨요 로그인에 캡챠(숫자 이미지)가 붙어 자동 로그인이 불가능하다.
 * 서버의 브라우저 화면을 그대로 받아 보고, 클릭·입력을 되돌려 보내 사람이 직접 로그인한다.
 * 한 번 로그인하면 세션 쿠키가 저장돼 만료 전까지 재사용된다.
 */

/** 서버 브라우저의 뷰포트. 화면에는 축소해 띄우고 클릭 좌표를 이 기준으로 환산한다. */
const DEFAULT_VIEWPORT = { width: 1920, height: 1080 };

export default function RemotePage() {
  const [service, setService] = useState<ServiceKey>('ddangyo');
  const [connected, setConnected] = useState(false);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [screen, setScreen] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [token, setToken] = useState(api.getRemoteToken);
  const [state, setState] = useState<api.RemoteState | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const urlRef = useRef<string | null>(null);

  // 화면 폴링 — 로그인 폼 조작에는 초당 2프레임이면 충분하다
  useEffect(() => {
    if (!connected) return;
    let alive = true;

    const tick = async () => {
      try {
        const url = await api.remoteScreen(service);
        if (!alive) return URL.revokeObjectURL(url);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current); // 누수 방지
        urlRef.current = url;
        setScreen(url);
      } catch {
        /* 일시적 실패는 다음 틱에서 회복된다 */
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [connected, service]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  /** 조작 결과에 담긴 상태(주소·포커스·채운 칸)를 항상 화면에 남긴다 */
  const run = async (fn: () => Promise<unknown>, onOk?: () => void) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fn();
      if (res && typeof res === 'object' && 'ok' in res) setState(res as api.RemoteState);
      onOk?.();
    } catch (e) {
      setMessage({ tone: 'err', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const connect = () =>
    run(async () => {
      api.setRemoteToken(token);
      const res = await api.remoteStart(service);
      if (res.viewport?.width && res.viewport?.height) setViewport(res.viewport);
      setConnected(true);
      setState(null);
    });

  const disconnect = () =>
    run(
      () => api.remoteCancel(service),
      () => {
        setConnected(false);
        setScreen(null);
      }
    );

  /** 표시된 이미지 좌표 → 서버 뷰포트 좌표 */
  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect || busy) return;

    const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
    const y = ((e.clientY - rect.top) / rect.height) * viewport.height;
    run(() => api.remoteClick(service, Math.round(x), Math.round(y)));
  };

  const finish = () =>
    run(async () => {
      const res = await api.remoteFinish(service);
      if (res.ok) {
        setConnected(false);
        setScreen(null);
        setMessage({ tone: 'ok', text: '로그인 완료 — 세션을 저장했습니다.' });
      } else {
        setMessage({ tone: 'err', text: res.error ?? '아직 로그인되지 않았습니다' });
      }
      return res;
    });

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Header title="원격 로그인" />

      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-bold text-zinc-900">연결</h2>
          <p className="text-sm text-zinc-500">
            로그인에 캡챠가 있는 플랫폼은 사장님이 직접 풀어야 합니다. 아래 화면에서 아이디·비밀번호와
            캡챠 숫자를 입력해 로그인하면 세션이 저장되어 다음부터는 자동으로 동작합니다.
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="플랫폼 선택">
            {ALL_SERVICES.map((key) => (
              <button
                key={key}
                type="button"
                disabled={connected}
                aria-pressed={service === key}
                onClick={() => setService(key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                  service === key ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {SERVICE_LABELS[key]}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-600">
              접근 토큰 <span className="text-zinc-400">(서버에 설정한 경우에만)</span>
            </span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={connected}
              autoComplete="off"
              className="h-12 w-full rounded-xl border-2 border-zinc-200 px-4 disabled:bg-zinc-50"
            />
          </label>

          {connected ? (
            <button
              type="button"
              disabled={busy}
              onClick={disconnect}
              className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 font-bold text-zinc-700 disabled:opacity-50"
            >
              연결 끊기
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={connect}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3.5 font-bold text-white disabled:opacity-50"
            >
              {busy ? '연결 중…' : `${SERVICE_LABELS[service]} 로그인 화면 열기`}
            </button>
          )}

          {message && (
            <p
              role="alert"
              className={`text-sm font-semibold ${
                message.tone === 'ok' ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {message.text}
            </p>
          )}
        </section>

        {connected && (
          <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="font-bold text-zinc-900">브라우저 화면</h2>
            <p className="text-xs text-zinc-500">
              아이디·비밀번호는 서버가 채웁니다. 화면의 보안문자만 아래에 적고 ‘채우기’를 누르세요.
            </p>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100">
              {screen ? (
                <img
                  ref={imgRef}
                  src={screen}
                  alt="서버 브라우저 화면"
                  onClick={handleClick}
                  className="w-full cursor-crosshair select-none"
                />
              ) : (
                <p className="py-16 text-center text-zinc-400">화면 불러오는 중…</p>
              )}
            </div>

            {state && (
              <dl className="space-y-0.5 rounded-xl bg-zinc-50 p-3 font-mono text-xs text-zinc-600">
                <div className="truncate">주소: {state.url}</div>
                <div className="truncate">
                  입력 대상: {state.focus ? `${state.focus.target} = ${state.focus.value}` : '없음'}
                  {state.focus?.readOnly && ' (읽기 전용)'}
                </div>
                {state.filled &&
                  Object.entries(state.filled).map(([field, r]) => (
                    <div key={field} className="truncate">
                      {field}: {r.found ? `${r.target} = ${r.after}` : '칸을 찾지 못함'}
                      {r.usedFallback && ' (생김새로 찾음)'}
                    </div>
                  ))}
              </dl>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder="화면의 보안문자"
                autoComplete="off"
                className="h-12 min-w-0 flex-1 rounded-xl border-2 border-zinc-200 px-4"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => api.remoteFill(service, captcha))}
                className="shrink-0 rounded-xl bg-zinc-900 px-5 font-bold text-white disabled:opacity-50"
              >
                채우기
              </button>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => api.remoteSubmit(service))}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3.5 font-bold text-white disabled:opacity-50"
            >
              로그인 버튼 누르기
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={finish}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 font-bold text-white disabled:opacity-50"
            >
              로그인 완료 — 세션 저장
            </button>

            <details className="rounded-xl border border-zinc-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-600">
                직접 조작 (자동 채우기가 안 될 때)
              </summary>
              <p className="mt-2 text-xs text-zinc-500">
                화면에서 입력할 칸을 누른 뒤 값을 적고 ‘입력’을 누르세요. 위의 ‘입력 대상’으로 어느
                칸에 들어가는지 확인할 수 있습니다.
              </p>

              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="입력할 값"
                  autoComplete="off"
                  className="h-12 min-w-0 flex-1 rounded-xl border-2 border-zinc-200 px-4"
                />
                <button
                  type="button"
                  disabled={busy || !text}
                  onClick={() => run(() => api.remoteType(service, text), () => setText(''))}
                  className="shrink-0 rounded-xl bg-zinc-700 px-5 font-bold text-white disabled:opacity-50"
                >
                  입력
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {(['Enter', 'Backspace', 'Tab'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => api.remoteKey(service, key))}
                    className="rounded-lg border-2 border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-50"
                  >
                    {key === 'Backspace' ? '지우기' : key}
                  </button>
                ))}
              </div>
            </details>
          </section>
        )}
      </main>
    </div>
  );
}
