import { Link } from 'react-router';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useRouteFocus } from '@/lib/useRouteFocus';

export function NotFoundView() {
  useDocumentTitle('페이지를 찾을 수 없음');
  const headingRef = useRouteFocus();
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-6 py-24">
      <p className="text-sm font-semibold text-green-600 dark:text-green-400">404</p>
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <Link
        to="/"
        className="mt-3 text-sm font-medium text-green-600 transition-colors hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
      >
        <span aria-hidden="true">← </span>홈으로 돌아가기
      </Link>
    </div>
  );
}
