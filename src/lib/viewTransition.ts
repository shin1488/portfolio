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

/**
 * 폰(좁은 화면)에서는 전환을 걸지 않는다.
 *
 * iOS Safari에서 뒤로가기 때 화면이 한 번 어두워졌다 밝아지는 증상이 남아 있는데, 기기에서
 * ?vt=off로 확인해 보니 전환을 끄면 사라진다. 스냅샷 합성 방식·화면 교체 시점을 여러 번 바꿔
 * 봤지만 잡히지 않았고, 이 엔진은 손에 잡히는 개발 환경이 없어(GPU 없는 리눅스에서는 WebKit이
 * 전환을 돌리다 프로세스째 죽는다) 더 좁힐 수단이 없다. 매끈한 전환보다 깜빡이지 않는 화면이
 * 낫다고 판단해, 문제가 확인된 폰 환경에서만 끈다. 넓은 화면은 그대로 크로스페이드를 쓴다.
 * 폭 기준은 팝업 여부와 같은 768px이다(폰은 카드 → 상세 페이지로 바로 넘어간다).
 */
function isPhone(): boolean {
  return window.matchMedia('(max-width: 767px)').matches;
}

function canTransition(): boolean {
  return (
    isEnabled('vt') &&
    !isPhone() &&
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
 *
 * 값을 모듈 변수가 아니라 문서(html의 속성)에 둔다. 개발 서버의 HMR은 이 모듈을 다시 실행해
 * 새 인스턴스를 만드는데, popstate 리스너(main.tsx에서 한 번 등록)는 옛 인스턴스를 붙잡고 있다.
 * 그러면 팝업이 새 인스턴스에 "멈춰"라고 적어도 리스너는 옛 인스턴스의 꺼진 값을 읽는다.
 * 문서에 적으면 인스턴스가 몇 개든 같은 값을 본다.
 */
const POP_PAUSED_ATTR = 'data-pop-paused';
const SWALLOW_POP_ATTR = 'data-swallow-pop';

export function pausePopTransition(paused: boolean) {
  const root = document.documentElement;
  if (paused) root.setAttribute(POP_PAUSED_ATTR, '');
  else root.removeAttribute(POP_PAUSED_ATTR);
}

/**
 * 다음 popstate 한 번은 전환 없이 흘려보낸다 — 팝업이 닫히면서 자기가 쌓아 둔 히스토리 항목을
 * 걷어낼 때 쓴다. 그 popstate는 라우트를 바꾸지 않으므로, 전환을 걸면 표식이 바뀌길 기다리다
 * 화면을 붙잡는다. 팝업이 이미 언마운트돼 '멈춰' 표시가 지워진 뒤에 popstate가 닿아도 안전하다.
 */
export function swallowNextPop() {
  document.documentElement.setAttribute(SWALLOW_POP_ATTR, '');
}

function isPopPaused(): boolean {
  const root = document.documentElement;
  if (root.hasAttribute(SWALLOW_POP_ATTR)) {
    root.removeAttribute(SWALLOW_POP_ATTR);
    return true;
  }
  return root.hasAttribute(POP_PAUSED_ATTR);
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
    if (isPopPaused() || !canTransition()) return;
    const before = currentMark();
    startAndIgnoreAbort(() => waitForRoute(before));
  });
}
