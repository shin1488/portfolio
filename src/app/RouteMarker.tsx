import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';
import { markRoute } from '@/lib/viewTransition';

/**
 * 현재 렌더된 라우트를 html의 data-route에 새긴다.
 *
 * 라우트 전환(크로스페이드)은 '새 화면이 실제로 커밋됐는지'를 알아야 스냅샷을 찍는데, 상세
 * 라우트가 lazy라 navigate 직후의 DOM은 아직 로딩 폴백이다. location.key는 히스토리 항목마다
 * 다르므로(뒤로가기 포함) 이 표식이 바뀌는 순간이 곧 새 화면이 커밋된 시점이다.
 * 페인트 전(useLayoutEffect)에 새겨야 전환 콜백이 그 시점을 정확히 잡는다.
 */
export function RouteMarker() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    markRoute(key);
  }, [key]);
  return null;
}
