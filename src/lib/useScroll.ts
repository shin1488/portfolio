import { useCallback, useEffect, useRef, useState } from 'react';

/** 문서 스크롤 진행률(0~1)과 일정 이상 내렸는지 여부를 rAF로 갱신한다. */
export function useScrollProgress(threshold = 400) {
  const [state, setState] = useState({ progress: 0, scrolled: false });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
      setState({ progress, scrolled: scrollTop > threshold });
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

  return state;
}

/** 주어진 heading id들 중 현재 읽고 있는 섹션 id를 반환한다(미니 목차 강조용). */
export function useActiveHeadingId(ids: string[]): {
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
    // 매 스크롤마다 헤딩의 실제 위치를 동기적으로 다시 읽어 활성 섹션을 정한다.
    // IntersectionObserver를 쓰지 않는 이유: 첫 방문 시 지연 로딩 이미지 디코딩으로 콜백 전달이
    // 지연·병합되면 빠르게 지나간 중간 섹션의 교차 변화를 놓쳐 강조를 건너뛰기 때문.
    const compute = () => {
      if (pinnedRef.current !== null) return; // 클릭 고정 중엔 스파이 무시
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      // 활성선(뷰포트 상단에서 약 28% 지점)에 헤딩 top이 닿는 스크롤 위치 = 그 헤딩의 활성 시작점.
      const line = Math.max(88, window.innerHeight * 0.28);
      const thresholds = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? y + el.getBoundingClientRect().top - line : Number.POSITIVE_INFINITY;
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
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute, { passive: true });
    window.addEventListener('wheel', unpin, { passive: true });
    window.addEventListener('touchmove', unpin, { passive: true });
    window.addEventListener('keydown', unpin);
    // 지연 로딩 이미지가 로드돼 문서 높이가 바뀌면(스크롤 이벤트 없이도) 다시 계산한다.
    const ro = new ResizeObserver(compute);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
      window.removeEventListener('wheel', unpin);
      window.removeEventListener('touchmove', unpin);
      window.removeEventListener('keydown', unpin);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { activeId, select };
}
