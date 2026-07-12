import { flushSync } from 'react-dom';
import { isEnabled } from './debugFlags';

/**
 * 라우트 전환을 크로스페이드로 감싸는 유틸(View Transitions).
 *
 * react-router의 navigate({ viewTransition: true })는 Data/Framework 모드 전용이라 우리
 * <BrowserRouter>(선언형 모드)에선 조용히 무시된다. 그래서 직접 startViewTransition으로 감싼다.
 *
 * 두 화면을 겹쳐 넘기는 크로스페이드만 쓴다(index.css의 ::view-transition-*(root)).
 * 요소를 짝지어 박스를 이어 붙이는 모프(view-transition-name 공유)도 만들어 봤지만, 대상이
 * 768 × 43,000px짜리 문서라 매 프레임 통째로 래스터화돼 무거웠다.
 */

const ROUTE_ATTR = 'data-route';

/** 현재 렌더된 라우트 표식 — React가 새 화면을 커밋했는지 판단하는 유일한 근거다. */
export function markRoute(key: string) {
  document.documentElement.setAttribute(ROUTE_ATTR, key);
}

function currentMark(): string | null {
  return document.documentElement.getAttribute(ROUTE_ATTR);
}

/**
 * startViewTransition 래퍼 — 전환이 다른 전환에 밀려 스킵되면 ready/finished가 reject되는데,
 * 핸들러를 안 달면 unhandled rejection으로 콘솔에 에러가 찍힌다(정상 동작인데도).
 * 실패해도 DOM은 그대로 갱신되므로 조용히 넘긴다.
 */
function startAndIgnoreAbort(update: () => void | Promise<void>) {
  const transition = document.startViewTransition(update);
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}

function canTransition(): boolean {
  return (
    isEnabled('vt') &&
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * 새 라우트가 실제로 DOM에 커밋될 때까지 기다린다.
 *
 * setTimeout(매크로태스크)으로 폴링한다 — startViewTransition의 업데이트 콜백 구간에서는
 * 브라우저가 렌더링을 멈추기 때문에 requestAnimationFrame 콜백이 아예 호출되지 않는다.
 * 여기서 rAF를 기다리면 콜백 프로미스가 영영 풀리지 않아 전환이 통째로 멎는다.
 * 반면 태스크·마이크로태스크는 계속 돌아가므로 React의 lazy 해소와 커밋은 그대로 진행된다.
 * (상세 라우트는 lazy라, 기다리지 않으면 '새 화면' 스냅샷이 로딩 화면을 잡는다)
 */
function waitForRoute(before: string | null, timeoutMs = 600): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const check = () => {
      if (currentMark() !== before || Date.now() > deadline) {
        resolve();
        return;
      }
      window.setTimeout(check, 16);
    };
    check();
  });
}

/**
 * 프로그램적 라우트 이동(헤더 내비·목록으로 돌아가기·팝업의 확대 등)을 크로스페이드로 감싼다.
 * flushSync로 라우트 전환을 동기 렌더시킨 뒤, 표식이 바뀔 때까지(= 새 화면이 커밋될 때까지) 기다린다.
 */
export function startRouteTransition(update: () => void) {
  if (!canTransition()) {
    update();
    return;
  }
  const before = currentMark();
  startAndIgnoreAbort(async () => {
    flushSync(update);
    await waitForRoute(before);
  });
}

/**
 * 뒤로가기가 '라우트 이동'이 아닌 상황(팝업 닫기)에서는 크로스페이드를 걸지 않는다.
 * 라우트가 바뀌지 않으므로 표식도 안 바뀌고, 그대로 두면 전환이 타임아웃까지 화면을 붙잡는다.
 */
let popPaused = false;

export function pausePopTransition(paused: boolean) {
  popPaused = paused;
}

/**
 * 뒤로/앞으로가기(popstate)도 같은 크로스페이드를 태운다.
 *
 * 반드시 React가 마운트되기 전에 호출해야 한다 — popstate 리스너는 등록 순서대로 실행되므로,
 * react-router보다 먼저 등록해야 아직 예전 화면인 상태에서 '이전 화면' 스냅샷을 찍을 수 있다.
 * (react-router의 리스너는 그 뒤에 돌아 라우트 state를 갱신하고, React가 커밋하면 표식이 바뀐다)
 */
export function installRouteTransition() {
  window.addEventListener('popstate', () => {
    if (popPaused || !canTransition()) return;
    const before = currentMark();
    startAndIgnoreAbort(() => waitForRoute(before));
  });
}
