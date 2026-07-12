import { Link, useNavigate } from 'react-router';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useRouteFocus } from '@/lib/useRouteFocus';
import { startRouteTransition } from '@/lib/viewTransition';

export function NotFoundView() {
  const navigate = useNavigate();
  useDocumentTitle('페이지를 찾을 수 없음');
  const headingRef = useRouteFocus();
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-6 py-24">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <Link
        to="/"
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          startRouteTransition(() => navigate('/'));
        }}
        className="mt-3 text-sm font-medium text-accent transition-colors hover:text-accent/80"
      >
        <span aria-hidden="true">← </span>홈으로 돌아가기
      </Link>
    </div>
  );
}
