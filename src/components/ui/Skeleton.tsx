import { cn } from '@/lib/cn';

/**
 * 로딩 자리표시자 — 은은하게 밝기가 오르내리는(pulse) 블록.
 *
 * 예전에는 점 49개짜리 SVG 스피너(FlickerSpinner)를 썼는데, 긴 상세 페이지에는 지연 로딩 이미지가
 * 수십 장이라 자리표시자마다 49개씩, 실측 1,764개의 무한 애니메이션이 메인 스레드에서 돌았다.
 * 여기서는 자리표시자당 opacity 애니메이션 하나만 쓴다(컴포지터가 처리).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="불러오는 중"
      className={cn('animate-pulse bg-zinc-800/70', className)}
    />
  );
}
