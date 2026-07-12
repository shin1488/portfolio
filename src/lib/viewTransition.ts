/**
 * 팝업 패널과 상세 본문이 공유하는 View Transition 이름.
 *
 * 두 요소가 같은 이름을 쓰면, '확대'로 라우트가 바뀌는 순간 브라우저가 이전 화면의 팝업 박스와
 * 새 화면의 본문 박스를 짝지어 위치·크기를 이어 붙인다 — 팝업이 상세 본문으로 늘어나 보인다.
 * 지속 시간·이징은 index.css의 ::view-transition-* 규칙에서 맞춘다.
 * View Transitions를 지원하지 않는 브라우저에서는 애니메이션 없이 즉시 이동한다.
 */
export const DOC_TRANSITION = 'project-doc';

/** 상세 본문(article)에 붙는 표식 — 전환 콜백이 '새 화면이 준비됐는지'를 이걸로 판단한다. */
export const DOC_TRANSITION_ATTR = 'data-project-doc';

/**
 * 요소가 DOM에 나타날 때까지 기다린다(최대 timeoutMs).
 *
 * setTimeout(매크로태스크)으로 폴링한다 — startViewTransition의 업데이트 콜백 구간에서는
 * 브라우저가 렌더링을 멈추기 때문에 requestAnimationFrame 콜백이 아예 호출되지 않는다.
 * 여기서 rAF를 기다리면 콜백 프로미스가 영영 풀리지 않아 전환이 통째로 멎는다.
 * 반면 태스크·마이크로태스크는 계속 돌아가므로, React의 lazy 해소와 커밋도 그대로 진행된다.
 */
export function waitForElement(selector: string, timeoutMs = 800): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const check = () => {
      if (document.querySelector(selector) || Date.now() > deadline) {
        resolve();
        return;
      }
      window.setTimeout(check, 16);
    };
    check();
  });
}
