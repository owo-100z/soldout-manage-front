import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Header from '../components/Header';
import ServiceSelector from '../components/ServiceSelector';
import ResultPanel from '../components/ResultPanel';
import {
  useCreateSchedule,
  useDeleteSchedule,
  useMenuGroups,
  useRunSchedules,
  useSchedules,
} from '../hooks/useApi';
import { ALL_SERVICES, SERVICE_LABELS, type MenuGroups, type ServiceKey } from '../types';

/**
 * 기간 품절 예약.
 *
 * 예약 단위는 메뉴가 아니라 **메뉴 그룹**이다. 매장 오픈 시각이 되면 스케줄러가
 * 메인화면에서 그 그룹의 품절 버튼을 누른 것과 똑같은 작업을 실행한다.
 * 종료일이 지나면 예약만 끝난다 (자동 판매재개는 하지 않는다).
 */
function groupNames(groups: MenuGroups, services: ServiceKey[]) {
  const names = new Set<string>();
  for (const service of services) {
    for (const [name, data] of Object.entries(groups[service] ?? {})) {
      if ((data.menu?.length ?? 0) + (data.option?.length ?? 0) > 0) names.add(name);
    }
  }
  return [...names];
}

export default function SchedulePage() {
  const [services, setServices] = useState<ServiceKey[]>(ALL_SERVICES);
  const [picked, setPicked] = useState<string[]>([]);
  const [endDate, setEndDate] = useState(() => dayjs().add(7, 'day').format('YYYY-MM-DD'));

  const groupsQuery = useMenuGroups();
  const schedules = useSchedules();
  const create = useCreateSchedule();
  const remove = useDeleteSchedule();
  const run = useRunSchedules();

  const names = useMemo(
    () => groupNames(groupsQuery.data ?? {}, services),
    [groupsQuery.data, services]
  );

  const toggle = (name: string) =>
    setPicked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const submit = () =>
    create.mutate({ groups: picked, services, endDate }, { onSuccess: () => setPicked([]) });

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Header title="기간 품절 예약" />

      <main className="mx-auto max-w-3xl space-y-4 p-4">
        {run.isSuccess && (
          <ResultPanel
            title="예약 품절 즉시 실행"
            response={run.data}
            onDismiss={() => run.reset()}
          />
        )}

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-bold text-zinc-900">새 예약</h2>
          <p className="text-sm text-zinc-500">
            매장 오픈 시각마다 선택한 그룹을 자동으로 품절 처리합니다. 메인화면에서 품절 버튼을 누른
            것과 같은 동작입니다.
          </p>

          <ServiceSelector selected={services} onChange={setServices} />

          <div>
            <span className="mb-1 block text-sm font-medium text-zinc-600">메뉴 그룹</span>
            {groupsQuery.isPending ? (
              <p className="py-4 text-center text-zinc-500">불러오는 중…</p>
            ) : names.length === 0 ? (
              <p className="py-4 text-center text-zinc-400">
                선택한 플랫폼에 등록된 그룹이 없습니다
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {names.map((name) => {
                  const on = picked.includes(name);
                  return (
                    <li key={name}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(name)}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                          on
                            ? 'bg-zinc-900 text-white'
                            : 'border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-600">종료일</span>
            <input
              type="date"
              value={endDate}
              min={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12 w-full rounded-xl border-2 border-zinc-200 px-4"
            />
          </label>

          <button
            type="button"
            disabled={picked.length === 0 || services.length === 0 || create.isPending}
            onClick={submit}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3.5 font-bold text-white disabled:opacity-50"
          >
            {create.isPending ? '등록 중…' : `예약 추가${picked.length ? ` (${picked.length}개 그룹)` : ''}`}
          </button>

          {create.isError && (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {(create.error as Error).message}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-bold text-zinc-900">진행 중인 예약</h2>
            <button
              type="button"
              disabled={run.isPending}
              onClick={() => run.mutate()}
              className="rounded-lg border-2 border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-50"
            >
              {run.isPending ? '실행 중…' : '지금 실행'}
            </button>
          </div>

          {run.isError && (
            <p role="alert" className="mb-3 text-sm font-semibold text-red-700">
              {(run.error as Error).message}
            </p>
          )}
          {run.isSuccess && run.data.note && (
            <p className="mb-3 text-sm text-zinc-500">{run.data.note}</p>
          )}

          {schedules.isPending && <p className="py-6 text-center text-zinc-500">불러오는 중…</p>}
          {schedules.isError && (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {(schedules.error as Error).message}
            </p>
          )}

          {schedules.isSuccess &&
            (schedules.data.length === 0 ? (
              <p className="py-6 text-center text-zinc-400">등록된 예약이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {schedules.data.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-800">{s.groups.join(', ')}</p>
                      <p className="text-xs text-zinc-500">
                        {s.services.map((k) => SERVICE_LABELS[k] ?? k).join(', ')} · {s.end_date}까지
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(`'${s.groups.join(', ')}' 예약을 종료할까요?`))
                          remove.mutate(s.id);
                      }}
                      className="rounded-lg border-2 border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-600 disabled:opacity-50"
                    >
                      종료
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </section>

        <p className="px-2 text-xs text-zinc-400">
          종료일이 지나면 예약만 끝납니다. 판매 재개는 메인화면에서 직접 해주세요.
        </p>
      </main>
    </div>
  );
}
