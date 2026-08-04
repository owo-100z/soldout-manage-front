import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * 렌더 중 예외가 나도 화면이 백지가 되지 않게 한다.
 * 구 버전은 경계가 없어 localStorage가 깨지거나 응답 형태가 달라지면 앱이 통째로 사라졌다.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('렌더 오류:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-6 text-center">
          <h1 className="text-lg font-bold text-zinc-900">화면을 표시하지 못했습니다</h1>
          <p className="mt-2 text-sm text-zinc-600 break-words">{error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }
}
