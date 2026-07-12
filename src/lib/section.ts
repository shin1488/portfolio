import { useEffect, useState } from 'react';

/**
 * sticky 헤더가 실제로 차지하는 높이(px). 상수로 박아 두면 safe-area 여백이 있는 기기에서
 * 어긋나므로 DOM에서 실측한다. 헤더가 없는 화면(렌더 전 등)이면 0.
 */
function headerHeight(): number {
  const header = document.querySelector('header');
  return header ? header.getBoundingClientRect().height : 0;
}

/**
 * 요소 top을 헤더 바로 아래에 맞춰 스크롤 — 헤더·rail·앵커 이동이 공유하는 로직.
 * 오프셋 0으로 두면 섹션 제목이 sticky 헤더에 가려지므로 헤더 높이만큼 덜 내려간다.
 */
export function scrollElementToTop(el: HTMLElement, behavior: ScrollBehavior = 'smooth') {
  const top = window.scrollY + el.getBoundingClientRect().top - headerHeight();
  window.scrollTo({ top: Math.max(0, top), behavior });
}

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  scrollElementToTop(el, behavior);
}

/**
 * 해시 히스토리 항목을 남기지 않고 해당 heading으로 부드럽게 스크롤한다.
 * (네이티브 `<a href="#id">`는 클릭마다 히스토리를 쌓아 뒤로가기가 섹션 순회가 되므로,
 *  목차·rail 클릭은 이 함수로 이동해 뒤로가기가 곧장 페이지 이탈이 되게 한다.)
 * scrollIntoView는 scroll-margin/scroll-padding을 존중하므로 앵커와 같은 위치에 착지한다.
 */
export function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/** 스크롤 스파이 — 뷰포트 중앙선(innerHeight/2)이 지나온 마지막 섹션 id를 반환한다. */
export function useActiveSection(ids: string[]): string {
  const key = ids.join('|');
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let current = ids[0] ?? '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
