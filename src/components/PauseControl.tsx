import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import DateTimePicker from './DateTimePicker';
import { fromBase, fromNow, toApiFormat } from '../lib/datetime';
import { usePause, useRelease } from '../hooks/useApi';
import type { RunResponse, ServiceKey } from '../types';

interface Props {
  services: ServiceKey[];
  onResult: (title: string, response: RunResponse) => void;
  onError: (message: string) => void;
}

const QUICK = [30, 60, 120];

export default function PauseControl({ services, onResult, onError }: Props) {
  const [endTime, setEndTime] = useState<Dayjs>(() => fromNow(0));
  const pause = usePause();
  const release = useRelease();
  const busy = pause.isPending || release.isPending;

  const run = (
    mutation: { mutateAsync: (v: never) => Promise<RunResponse> },
    variables: unknown,
    title: string
  ) => {
    mutation
      .mutateAsync(variables as never)
      .then((res) => onResult(title, res))
      .catch((e: Error) => onError(e.message));
  };

  return (
    <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <h2 className="font-bold text-zinc-900">매장 임시중지</h2>

      <div className="grid grid-cols-4 gap-2">
        {QUICK.map((mins) => (
          <button
            key={mins}
            type="button"
            disabled={busy}
            onClick={() => setEndTime(fromBase(endTime, mins))}
            className="rounded-xl bg-zinc-100 px-2 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
          >
            + {mins < 60 ? `${mins}분` : `${mins / 60}시간`}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => setEndTime(fromNow(0))}
          className="rounded-xl bg-zinc-100 px-2 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
        >
          초기화
        </button>
      </div>

      <DateTimePicker value={endTime} onChange={setEndTime} disabled={busy} />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy || endTime.isBefore(dayjs())}
          onClick={() => run(pause, { services, to: toApiFormat(endTime) }, '임시중지')}
          className="rounded-xl bg-zinc-900 px-4 py-3.5 font-bold text-white disabled:opacity-50"
        >
          {pause.isPending ? '처리 중…' : '임시중지'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(release, services, '임시중지 해제')}
          className="rounded-xl border-2 border-zinc-200 px-4 py-3.5 font-bold text-zinc-700 disabled:opacity-50"
        >
          {release.isPending ? '처리 중…' : '해제'}
        </button>
      </div>

      {endTime.isBefore(dayjs().startOf('day')) && (
        <p className="text-sm text-red-600">종료 시각이 현재보다 이전입니다.</p>
      )}
    </section>
  );
}
