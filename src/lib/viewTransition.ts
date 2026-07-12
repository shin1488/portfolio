/**
 * 팝업 → 상세 페이지 전환 유틸.
 *
 * 전환은 두 화면을 겹쳐 넘기는 크로스페이드다(index.css의 ::view-transition-*(root)).
 * 두 요소를 짝지어 박스를 이어 붙이는 모프(view-transition-name 공유)도 만들어 봤지만,
 * 확대되는 모양이 어색한 데다 대상이 768 × 43,000px짜리 문서라 매 프레임 통째로 래스터화돼
 * 무거웠다. 지금은 root 스냅샷(뷰포트 크기)만 겹친다.
 */

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
