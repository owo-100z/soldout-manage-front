import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { usePause, useRelease } from '../hooks/usePause';
import DateTimePicker from './DateTimePicker';
import type { ServiceKey } from '../types';

interface Props {
  selectedServices: ServiceKey[];
  isLoading?: boolean;  // 외부에서 전달받는 로딩 상태
}

function toApiFormat(dateTime: Dayjs) {
  // "2026-06-06T13:00" → "202606061300"
  return dateTime.format('YYYYMMDDHHmm');
}

export default function PauseControl({ selectedServices, isLoading: externalLoading }: Props) {
  const [endTime, setEndTime] = useState<Dayjs>(() => dayjs());
  
  const pause = usePause();
  const release = useRelease();

  const addMinutes = (mins: number) => {
    setEndTime(prev => prev.add(mins, 'minute'));
  };

  const reset = () => setEndTime(dayjs());

  const handlePause = () => {
    pause.mutate({ services: selectedServices, to: toApiFormat(endTime) });
  };

  const handleRelease = () => {
    release.mutate(selectedServices);
  };

  const isPending = pause.isPending || release.isPending || externalLoading;

  return (
    <div className="relative space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-wrap">
        {[
          { label: '+30분', mins: 30 },
          { label: '+1시간', mins: 60 },
          { label: '+2시간', mins: 120 },
          { label: '+3시간', mins: 180 },
        ].map(({ label, mins }) => (
          <button
            key={label}
            onClick={() => addMinutes(mins)}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-2xl sm:text-base font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-50"
          >
            {label}
          </button>
        ))}
        <button
          onClick={reset}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-base font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors hidden sm:block disabled:opacity-50"
        >
          초기화
        </button>
      </div>

      <div className="flex gap-2 items-center">
        {/* DateTimePicker 컴포넌트 사용 */}
        <div className="flex-1">
          <DateTimePicker
            initialValue={endTime.format('YYYY-MM-DDTHH:mm')}
            onChange={(value) => {
              if (value) {
                setEndTime(value);
              }
            }}
            showTime={true}
          />
        </div>
        <button
          onClick={reset}
          className="px-3 py-3 rounded-lg text-[4vw] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors sm:hidden whitespace-nowrap disabled:opacity-50"
          disabled={isPending}
        >
          초기화
        </button>

        <button
          onClick={handlePause}
          disabled={isPending}
          className="px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md disabled:opacity-50 hidden sm:block"
        >
          임시중지
        </button>
        <button
          onClick={handleRelease}
          disabled={isPending}
          className="px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md disabled:opacity-50 hidden sm:block"
        >
          해제
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 items-center">
        <button
          onClick={handlePause}
          disabled={isPending}
          className="px-4 py-3 rounded-xl text-3xl font-semibold bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md disabled:opacity-50 sm:hidden"
        >
          임시중지
        </button>
        <button
          onClick={handleRelease}
          disabled={isPending}
          className="px-4 py-3 rounded-xl text-3xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md disabled:opacity-50 sm:hidden"
        >
          해제
        </button>
      </div>

      {/* 전체 화면 로딩 오버레이 */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-lg font-medium">처리 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
