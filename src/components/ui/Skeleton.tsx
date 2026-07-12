import { cn } from '@/lib/cn';

/**
 * 로딩 자리표시자 — 은은하게 밝기가 오르내리는(pulse) 블록.
 *
 * 예전에는 점 49개짜리 SVG 스피너(FlickerSpinner)를 썼는데, 긴 상세 페이지에는 지연 로딩 이미지가
 * 수십 장이라 자리표시자마다 49개씩, 실측 1,764개의 무한 애니메이션이 메인 스레드에서 돌았다.
 * 여기서는 자리표시자당 opacity 애니메이션 하나만 쓴다(컴포지터가 처리).
 *
 * div가 아니라 span(+block)인 이유: 마크다운 이미지는 문단 안에 렌더되는데(`<p><span><img>`),
 * p는 div를 자손으로 가질 수 없어 브라우저가 파싱 단계에서 div를 p 밖으로 끌어낸다. 그러면
 * React가 만든 트리와 실제 DOM이 어긋나 자리표시자가 이미지 위가 아닌 곳에 붙는다.
 * span은 문단 안에서도 유효하고, block을 걸어 두면 상자로서의 동작은 div와 같다.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="불러오는 중"
      className={cn('block animate-pulse bg-zinc-800/70', className)}
    />
  );
}
