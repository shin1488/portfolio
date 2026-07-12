import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * 문서를 threshold 이상 내렸는지만 반환한다(맨 위로 버튼 노출용).
 * 진행률은 여기서 다루지 않는다 — 매 프레임 setState로 진행률을 흘리면 그 컴포넌트 트리가
 * 프레임마다 다시 렌더돼 진행 바가 끊겨 보인다. 진행 바는 ScrollProgressBar가 DOM을 직접
 * 갱신하는 방식으로 그린다. 이 훅은 참/거짓이 뒤집힐 때만 렌더를 일으킨다.
 */
export function useScrolledPast(threshold = 400): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = window.scrollY > threshold;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}

/**
 * 주어진 heading id들 중 현재 읽고 있는 섹션 id를 반환한다(목차 rail 강조용).
 * containerRef를 주면 그 컨테이너의 내부 스크롤을, 없으면 문서 스크롤을 기준으로 삼는다
 * (상세 페이지는 문서, 팝업은 패널 본문이 스크롤 주체다).
 */
export function useActiveHeadingId(
  ids: string[],
  containerRef?: RefObject<HTMLElement | null>,
): {
  activeId: string;
  select: (id: string) => void;
} {
  const key = ids.join('|');
  const [activeId, setActiveId] = useState(ids[0] ?? '');
  // 클릭으로 고른 항목을 사용자가 직접 스크롤하기 전까지 고정한다(스파이가 덮어쓰지 않도록).
  const pinnedRef = useRef<string | null>(null);

  const select = useCallback((id: string) => {
    pinnedRef.current = id;
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (!ids.length) return;
    pinnedRef.current = null; // 페이지(목차)가 바뀌면 고정 해제
    const container = containerRef?.current ?? null;
    // 스크롤 이벤트를 받을 대상 — 컨테이너 스크롤이면 그 요소, 아니면 window.
    const scroller: HTMLElement | Window = container ?? window;

    // 매 스크롤마다 헤딩의 실제 위치를 동기적으로 다시 읽어 활성 섹션을 정한다.
    // IntersectionObserver를 쓰지 않는 이유: 첫 방문 시 지연 로딩 이미지 디코딩으로 콜백 전달이
    // 지연·병합되면 빠르게 지나간 중간 섹션의 교차 변화를 놓쳐 강조를 건너뛰기 때문.
    const compute = () => {
      if (pinnedRef.current !== null) return; // 클릭 고정 중엔 스파이 무시
      const viewH = container ? container.clientHeight : window.innerHeight;
      const maxScroll = container
        ? container.scrollHeight - container.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const y = container ? container.scrollTop : window.scrollY;
      // 헤딩의 '스크롤 좌표'는 뷰포트 좌표에서 컨테이너 상단을 빼고 현재 스크롤을 더해 얻는다.
      const originTop = container ? container.getBoundingClientRect().top : 0;
      // 활성선(뷰포트 상단에서 약 28% 지점)에 헤딩 top이 닿는 스크롤 위치 = 그 헤딩의 활성 시작점.
      const line = Math.max(88, viewH * 0.28);
      const thresholds = ids.map((id) => {
        const el = document.getElementById(id);
        return el
          ? y + (el.getBoundingClientRect().top - originTop) - line
          : Number.POSITIVE_INFINITY;
      });

      // 문서 끝이라 활성선까지 못 올라오는 뒤쪽 헤딩들은 threshold가 maxScroll을 넘어 한 점에 뭉친다
      // (그래서 마지막만 강조되고 그 앞 섹션들이 건너뛰어짐). 남은 스크롤 구간을 그 헤딩들에게
      // 균등 분배해, 바닥 근처를 스크롤하면 rail이 하나씩 지나가게 한다. (마지막은 maxScroll에 배치)
      if (maxScroll > 0) {
        const firstTail = thresholds.findIndex((t) => t > maxScroll);
        if (firstTail !== -1) {
          const start = firstTail > 0 ? Math.min(thresholds[firstTail - 1], maxScroll) : 0;
          const count = thresholds.length - firstTail;
          for (let j = 0; j < count; j++) {
            thresholds[firstTail + j] = start + ((maxScroll - start) * (j + 1)) / count;
          }
        }
      }

      let activeIndex = 0;
      for (let i = 0; i < thresholds.length; i++) {
        if (y >= thresholds[i] - 1) activeIndex = i;
      }
      const current = ids[activeIndex];
      setActiveId((prev) => (prev === current ? prev : current));
    };

    // 사용자가 직접 스크롤(휠/터치/키)하면 클릭 고정을 해제한다(프로그램적 smooth 스크롤은 유지).
    const unpin = () => {
      pinnedRef.current = null;
    };

    compute();
    scroller.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute, { passive: true });
    window.addEventListener('wheel', unpin, { passive: true });
    window.addEventListener('touchmove', unpin, { passive: true });
    window.addEventListener('keydown', unpin);
    // 지연 로딩 이미지가 로드돼 문서(또는 컨테이너) 높이가 바뀌면 스크롤 이벤트 없이도 다시 계산한다.
    const ro = new ResizeObserver(compute);
    ro.observe(container ?? document.body);
    return () => {
      scroller.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
      window.removeEventListener('wheel', unpin);
      window.removeEventListener('touchmove', unpin);
      window.removeEventListener('keydown', unpin);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, containerRef]);

  return { activeId, select };
}
