import { useMutation } from '@tanstack/react-query';
import { pauseStore, releaseStore } from '../api/api';
import type { ServiceKey } from '../types';

function getServiceLabel(service: string): string {
  const labels: Record<string, string> = {
    baemin: '배민',
    coupang: '쿠팡',
    ddangyo: '땡겨요',
    yogiyo: '요기요',
  };
  return labels[service] || service;
}

interface ApiResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

function showResultAlert(results: Record<string, ApiResult>, pause: boolean = false): void {
  const failedServices: string[] = [];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const [service, result] of Object.entries(results)) {
    if (result.success) {
      totalSuccess++;
    } else {
      totalFailed++;
      failedServices.push(getServiceLabel(service));
    }
  }

  if (totalFailed === 0) {
    alert(`임시중지가 ${pause ? '설정' : '해제'}되었습니다.`);
  } else {
    alert(`임시중지가 ${pause ? '설정' : '해제'}되었습니다.\n실패한 서비스: [${failedServices.join(', ')}]`);
  }
}

export function usePause(options?: {
  onSuccess?: (results: Record<string, ApiResult>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (payload: { services: ServiceKey[]; from?: string; to: string }) =>
      pauseStore(payload),
    onSuccess: (data: { data?: Record<string, ApiResult> }) => {
      const results = data?.data || {};
      showResultAlert(results, true);
      options?.onSuccess?.(results);
    },
    onError: (error: Error) => {
      alert(`오류 발생: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

export function useRelease(options?: {
  onSuccess?: (results: Record<string, ApiResult>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (services: ServiceKey[]) => releaseStore(services),
    onSuccess: (data: { data?: Record<string, ApiResult> }) => {
      const results = data?.data || {};
      showResultAlert(results);
      options?.onSuccess?.(results);
    },
    onError: (error: Error) => {
      alert(`오류 발생: ${error.message}`);
      options?.onError?.(error);
    },
  });
}
