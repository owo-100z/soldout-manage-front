import { useState } from 'react';
import Header from '../components/Header';
import ServiceSelector from '../components/ServiceSelector';
import PauseControl from '../components/PauseControl';
import MenuGrid from '../components/MenuGrid';
import ResultPanel from '../components/ResultPanel';
import { useMenuGroups } from '../hooks/useApi';
import { ALL_SERVICES, type RunResponse, type ServiceKey } from '../types';

export default function MainPage() {
  const [services, setServices] = useState<ServiceKey[]>([...ALL_SERVICES]);
  const [result, setResult] = useState<{ title: string; response: RunResponse } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groupsQuery = useMenuGroups();

  const onResult = (title: string, response: RunResponse) => {
    setError(null);
    setResult({ title, response });
  };
  const onError = (message: string) => {
    setResult(null);
    setError(message);
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Header title="품절 관리" />

      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <ServiceSelector selected={services} onChange={setServices} />

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <ResultPanel
            title={result.title}
            response={result.response}
            onDismiss={() => setResult(null)}
          />
        )}

        <PauseControl services={services} onResult={onResult} onError={onError} />

        {groupsQuery.isPending && (
          <p className="py-8 text-center text-zinc-500">메뉴 그룹 불러오는 중…</p>
        )}

        {groupsQuery.isError && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              메뉴 그룹을 불러오지 못했습니다: {(groupsQuery.error as Error).message}
            </p>
            <button
              type="button"
              onClick={() => groupsQuery.refetch()}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        )}

        {groupsQuery.isSuccess && (
          <MenuGrid
            services={services}
            groups={groupsQuery.data}
            onResult={onResult}
            onError={onError}
          />
        )}
      </main>
    </div>
  );
}
