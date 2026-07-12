/**
 * 팝업 패널과 상세 본문이 공유하는 View Transition 이름.
 *
 * 두 요소가 같은 이름을 쓰면, '확대'로 라우트가 바뀌는 순간 브라우저가 이전 화면의 팝업 박스와
 * 새 화면의 본문 박스를 짝지어 위치·크기를 이어 붙인다 — 팝업이 상세 본문으로 늘어나 보인다.
 * 지속 시간·이징은 index.css의 ::view-transition-* 규칙에서 맞춘다.
 * View Transitions를 지원하지 않는 브라우저에서는 애니메이션 없이 즉시 이동한다.
 */
export const DOC_TRANSITION = 'project-doc';
