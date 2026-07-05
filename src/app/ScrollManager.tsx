import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { scrollElementToTop } from '@/lib/section';

/**
 * 라우트 이동 시 hash 앵커로 스크롤·포커스하고, hash가 없으면 최상단으로 이동한다.
 * 뒤로/앞으로가기(POP)는 브라우저의 스크롤 위치 복원에 맡긴다.
 */
export function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const isInitialLoad = isFirstRender.current;
    isFirstRender.current = false;
    // 최초 진입도 navigationType이 POP으로 보고되므로, 진짜 히스토리 이동만 스킵한다.
    if (navigationType === 'POP' && !isInitialLoad) {
      return;
    }

    // 상세 → 목록 복귀: 특정 프로젝트 구간으로 되돌리는 건 ProjectsSection이 담당하므로 양보한다.
    // (여기서 앵커 스크롤을 하면 최상단으로 갔다가 다시 튀는 이중 스크롤이 생긴다)
    const state = location.state as { focusProjectIndex?: number } | null;
    if (typeof state?.focusProjectIndex === 'number') {
      return;
    }

    if (location.hash) {
      // 한글 등 비ASCII id는 hash가 퍼센트 인코딩되므로 디코딩해 매칭한다.
      const rawId = location.hash.slice(1);
      const id = (() => {
        try {
          return decodeURIComponent(rawId);
        } catch {
          return rawId;
        }
      })();
      const target = document.getElementById(id) ?? document.getElementById(rawId);
      if (target) {
        // 헤더·rail(scrollToSection)과 동일한 오프셋 0 로직으로 이동해 착지 좌표를 통일한다.
        // (scrollIntoView는 scroll-margin을 반영해 56px 덜 스크롤 → 살짝 위쪽에 멈추던 문제)
        scrollElementToTop(target, 'instant');
        // 시각적 스크롤과 함께 낭독/포커스 위치도 앵커로 옮긴다.
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus({ preventScroll: true });
        return;
      }
    }
    // 최초 진입(새로고침 포함)은 브라우저가 스스로 위치를 복원하므로 건드리지 않고,
    // 라우트 전환의 최상단 리셋은 smooth 글라이드 없이 즉시 이동한다.
    if (!isInitialLoad) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    // location.key는 같은 주소로의 재이동에서도 바뀌므로 매 네비게이션마다 실행된다.
  }, [location.key, navigationType]);
  return null;
}
