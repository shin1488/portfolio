import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * 페이지 제목(h1)에 마운트 시 포커스를 옮겨, SPA 라우트 전환을
 * 스크린리더·키보드 사용자가 인지하게 한다.
 * 최초 로드(key === 'default')와 hash 내비게이션(ScrollManager가
 * 앵커에 포커스를 줌)은 건너뛴다.
 */
export function useRouteFocus() {
  const ref = useRef<HTMLHeadingElement>(null);
  const { key, hash } = useLocation();

  useEffect(() => {
    if (key !== 'default' && !hash) {
      ref.current?.focus({ preventScroll: true });
    }
    // 마운트 시 1회만 실행 — key/hash는 마운트 시점 값만 쓴다.
  }, []);

  return ref;
}
