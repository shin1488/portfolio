import { type RefObject, useEffect, useState } from 'react';

/**
 * 핀 고정(sticky) 스크롤 섹션의 진행도를 활성 인덱스로 매핑한다.
 * 트랙(세로로 긴 컨테이너)이 뷰포트를 지나는 비율 p(0~1)를 count개 구간으로 나눠
 * floor(p * count * 0.999)로 인덱스를 낸다(0.999는 p=1에서 count를 넘지 않게 하는 클램프).
 * paused=true면(메뉴 호버 등) 스크롤 갱신을 멈춰 사용자의 선택을 우선한다.
 * initialIndex는 마운트 시 시작 인덱스 — 목록 복귀처럼 특정 위치로 바로 착지시킬 때 쓴다
 * (첫 렌더부터 해당 인덱스를 활성화해 0→k 크로스페이드/상단 플래시를 없앤다).
 * rAF로 스로틀한다.
 */
export function useStickyProgress(
  trackRef: RefObject<HTMLElement | null>,
  count: number,
  paused = false,
  initialIndex = 0,
): number {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (paused) return;
      const el = trackRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return; // 트랙이 짧으면(모바일 폴백 등) 매핑하지 않는다
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / scrollable));
      const i = Math.min(count - 1, Math.floor(p * count * 0.999));
      setIndex((prev) => (i === prev ? prev : i));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [trackRef, count, paused]);

  return index;
}
