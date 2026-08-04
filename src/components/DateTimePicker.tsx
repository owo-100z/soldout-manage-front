import { useEffect, useRef, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { combine, formatLabel, HOURS, MINUTES, pad2 } from '../lib/datetime';

interface Props {
  value: Dayjs;
  onChange: (next: Dayjs) => void;
  disabled?: boolean;
}

/**
 * 달력 + 시/분 선택.
 *
 * 구 버전의 P0 버그 두 가지를 피한다.
 *  1) 마운트 effect가 시/분을 11:00으로 하드코딩해 무엇을 골라도 11:00이 전송됐다
 *     → value에서 실제 시/분을 읽는다.
 *  2) select의 value가 "0"인데 옵션은 "00"이라 매칭에 실패해 30분이 표시되지 않았다
 *     → 양쪽 모두 pad2로 2자리 문자열을 쓴다.
 */
export default function DateTimePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => value.startOf('month'));
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  // 열 때마다 현재 값에서 초안을 다시 만든다
  useEffect(() => {
    if (open) {
      setDraft(value);
      setMonth(value.startOf('month'));
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const start = month.startOf('month');
  const days: (Dayjs | null)[] = [
    ...Array.from({ length: start.day() }, () => null),
    ...Array.from({ length: month.daysInMonth() }, (_, i) => start.add(i, 'day')),
  ];

  const confirm = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-14 w-full items-center justify-between rounded-xl border-2 border-zinc-200 bg-white px-4 text-left font-bold text-zinc-800 disabled:opacity-50"
      >
        <span className="text-lg">{formatLabel(value)} 까지</span>
        <span aria-hidden="true" className="text-zinc-400">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="종료 일시 선택"
          className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => setMonth((m) => m.subtract(1, 'month'))}
              className="rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
            >
              ‹
            </button>
            <span className="font-bold text-zinc-800">{month.format('YYYY년 M월')}</span>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => setMonth((m) => m.add(1, 'month'))}
              className="rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-zinc-400">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day, i) =>
              day === null ? (
                <span key={`pad-${i}`} />
              ) : (
                <button
                  key={day.format('YYYY-MM-DD')}
                  type="button"
                  aria-label={day.format('YYYY년 M월 D일')}
                  aria-current={day.isSame(draft, 'day') ? 'date' : undefined}
                  onClick={() => setDraft(combine(day, draft.hour(), draft.minute()))}
                  className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                    day.isSame(draft, 'day')
                      ? 'bg-zinc-900 text-white'
                      : day.isBefore(dayjs(), 'day')
                        ? 'text-zinc-300'
                        : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {day.date()}
                </button>
              )
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">시</span>
              <select
                value={pad2(draft.hour())}
                onChange={(e) => setDraft(combine(draft, Number(e.target.value), draft.minute()))}
                className="h-12 w-full rounded-xl border-2 border-zinc-200 bg-white px-3 font-bold text-zinc-800"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">분</span>
              <select
                value={pad2(Math.floor(draft.minute() / 10) * 10)}
                onChange={(e) => setDraft(combine(draft, draft.hour(), Number(e.target.value)))}
                className="h-12 w-full rounded-xl border-2 border-zinc-200 bg-white px-3 font-bold text-zinc-800"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl bg-zinc-100 px-4 py-3 font-semibold text-zinc-600"
            >
              취소
            </button>
            <button
              type="button"
              onClick={confirm}
              className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white"
            >
              {formatLabel(draft)} 선택
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
