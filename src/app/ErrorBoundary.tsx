import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 값이 바뀌면(라우트 이동 등) 에러 상태를 리셋한다 */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * 라우트 렌더 중 오류(재배포 후 stale 청크 로드 실패 등)가 앱 전체를
 * unmount시키지 않도록 막는 백스톱. 선언형 BrowserRouter에는
 * errorElement가 없으므로 직접 구현한다.
 * resetKey가 바뀌면 에러 상태를 풀어, 네비게이션으로 빠져나올 수 있게 한다.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-6 py-24">
          <h1 className="text-2xl font-bold tracking-tight">문제가 발생했습니다</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            페이지를 불러오는 중 오류가 발생했습니다. 새로고침하거나 홈으로 이동해 주세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              새로고침
            </button>
            {/* 전체 페이지 이동이라 에러 상태와 무관하게 확실히 홈으로 빠져나간다 */}
            <a
              href="/"
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500"
            >
              홈으로
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
