import { useEffect, useState } from 'react';

/**
 * 섹션 최상단(핀 트랙이 고정되기 시작하는 지점)으로 부드럽게 스크롤한다.
 * 헤더 오프셋 0 — 네이티브 앵커 + scroll-padding은 핀 트랙보다 위로 잡히므로 쓰지 않는다.
 */
// 헤더·rail·섹션 스냅이 서로(또는 자기 자신)의 스크롤에 끼어들지 않도록, 프로그램적 스크롤
// 동안 플래그를 세운다. 스크롤이 130ms간 멈추면 해제한다.
let programmaticScrolling = false;
let progTimer = 0;
const clearProgFlag = () => {
  window.clearTimeout(progTimer);
  progTimer = window.setTimeout(() => {
    programmaticScrolling = false;
    window.removeEventListener('scroll', clearProgFlag);
  }, 130);
};
function markProgrammaticScroll() {
  if (!programmaticScrolling) {
    programmaticScrolling = true;
    window.addEventListener('scroll', clearProgFlag, { passive: true });
  }
  clearProgFlag(); // 디바운스 재무장
}

/** 프로그램적 스크롤(헤더·rail·섹션 스냅)이 진행 중인지 — 섹션 스냅이 이때는 끼어들지 않게 한다. */
export function isProgrammaticScroll(): boolean {
  return programmaticScrolling;
}

/** 요소 top을 뷰포트 top(오프셋 0)에 맞춰 스크롤 — 헤더·rail·앵커 이동이 공유하는 로직. */
export function scrollElementToTop(el: HTMLElement, behavior: ScrollBehavior = 'smooth') {
  markProgrammaticScroll();
  window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top, behavior });
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

/** 핀 트랙 안의 특정 스텝(구간 중앙)으로 스크롤 — dots·이전/다음 버튼·목록 복귀용. */
export function scrollToTrackStep(
  el: HTMLElement | null,
  index: number,
  count: number,
  behavior: ScrollBehavior = 'smooth',
) {
  if (!el) return;
  const scrollable = el.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return;
  const trackTop = window.scrollY + el.getBoundingClientRect().top;
  markProgrammaticScroll();
  window.scrollTo({ top: trackTop + ((index + 0.5) / count) * scrollable, behavior });
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
