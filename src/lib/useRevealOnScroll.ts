import { useLayoutEffect, type RefObject } from 'react';

/**
 * 컨테이너 안의 요소들을 뷰포트(또는 지정한 스크롤 컨테이너)에 들어올 때 하나씩 떠오르게 한다.
 * 홈의 Reveal은 JSX로 감싸는 방식이지만, 마크다운 본문은 렌더 결과를 감쌀 수 없으므로
 * 렌더된 DOM에 클래스를 붙여 같은 효과를 낸다.
 *
 * 동작 줄이기(prefers-reduced-motion) 설정이면 클래스를 붙이지 않아 처음부터 그대로 보인다.
 *
 * useEffect가 아니라 useLayoutEffect인 이유: useEffect는 페인트 뒤에 돌기 때문에 블록들이 이미
 * opacity 1로 한 번 그려진 뒤 숨김 클래스가 붙는다. 그러면 브라우저가 그것을 '변화'로 보고
 * 문서 안 모든 블록에 1 → 0 트랜지션을 동시에 걸어 버린다(상세 페이지에서 2,000개 넘는 애니메이션이
 * 한꺼번에 돌았다). 페인트 전에 붙이면 초기 스타일이 곧 opacity 0이라 트랜지션이 아예 생기지 않고,
 * 화면에 들어온 블록만 is-visible로 한 번 전환된다.
 */
export function useRevealOnScroll(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  scrollRootRef?: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (!items.length) return;
    items.forEach((item) => item.classList.add('reveal-item'));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      {
        root: scrollRootRef?.current ?? null,
        // 요소가 조금이라도 걸치면 바로 켠다 — 임계값이나 음수 여백을 두면 빠르게 스크롤할 때
        // 글이 화면에 들어온 뒤에야 뒤늦게 떠올라 따라오지 못하는 느낌이 난다.
        threshold: 0,
        rootMargin: '0px 0px 120px 0px',
      },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [containerRef, selector, scrollRootRef]);
}
