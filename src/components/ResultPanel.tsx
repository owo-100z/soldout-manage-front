import { SERVICE_LABELS, type RunResponse, type ServiceKey, type ServiceResult } from '../types';

interface Props {
  title: string;
  response: RunResponse;
  onRetryFailed?: (services: ServiceKey[]) => void;
  onDismiss: () => void;
}

const STAGE_LABEL: Record<string, string> = {
  login: '로그인 실패',
  context: '브라우저 오류',
  execute: '처리 실패',
};

const ACTION_LABEL: Record<string, string> = {
  pause: '임시중지 성공',
  release: '해제 성공',
};

function summarize(r: ServiceResult): { icon: string; text: string; tone: string } {
  if (!r.ok) {
    const stage = r.stage ? STAGE_LABEL[r.stage] ?? '실패' : '실패';
    return { icon: '✕', text: r.error ? `${stage} · ${r.error}` : stage, tone: 'text-red-600' };
  }

  // 임시중지/해제는 건수를 세지 않는다. 아래 '대상 없음'은 품절용이라 여기서 갈라야 한다.
  if (r.action) {
    return {
      icon: '✓',
      text: r.alreadyReleased ? '이미 해제됨' : ACTION_LABEL[r.action],
      tone: 'text-emerald-600',
    };
  }

  const counts = [r.menu, r.option].filter((t) => t && !t.skipped);
  if (!counts.length) {
    return { icon: '—', text: '대상 없음', tone: 'text-zinc-400' };
  }

  const succeeded = counts.reduce((n, t) => n + (t?.succeeded ?? 0), 0);
  return { icon: '✓', text: `${succeeded}건 처리`, tone: 'text-emerald-600' };
}

/**
 * 플랫폼별 결과를 화면에 남긴다.
 * 구 버전은 alert() 한 줄로 뭉뚱그려서, 어느 플랫폼이 왜 실패했는지 알 수 없었다.
 */
export default function ResultPanel({ title, response, onRetryFailed, onDismiss }: Props) {
  const entries = Object.entries(response.results) as [ServiceKey, ServiceResult][];
  const failed = entries.filter(([, r]) => !r.ok).map(([key]) => key);

  return (
    <section
      aria-live="polite"
      className={`rounded-2xl border p-4 ${
        response.ok ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-zinc-900">
          {title} {response.ok ? '완료' : `— ${failed.length}개 플랫폼 실패`}
        </h3>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="결과 닫기"
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-white/60"
        >
          닫기
        </button>
      </div>

      <ul className="mt-3 space-y-1.5">
        {entries.map(([key, r]) => {
          const { icon, text, tone } = summarize(r);
          return (
            <li key={key} className="flex items-baseline gap-2 text-sm">
              <span className={`w-4 shrink-0 font-bold ${tone}`} aria-hidden="true">
                {icon}
              </span>
              <span className="w-16 shrink-0 font-semibold text-zinc-700">
                {SERVICE_LABELS[key]}
              </span>
              <span className={`break-words ${tone}`}>{text}</span>
            </li>
          );
        })}
      </ul>

      {failed.length > 0 && onRetryFailed && (
        <button
          type="button"
          onClick={() => onRetryFailed(failed)}
          className="mt-3 w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          실패한 {failed.length}개만 다시 시도
        </button>
      )}
    </section>
  );
}
