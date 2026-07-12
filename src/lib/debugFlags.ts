/**
 * 실기기에서 원인을 좁히기 위한 임시 스위치.
 *
 * iOS Safari에서만 나타나는 증상(뒤로가기 때 화면이 한 번 어두워졌다 밝아진다)이 있는데, 이 엔진은
 * 손에 잡히는 개발 환경이 없어 코드만 보고는 어느 요소가 범인인지 가릴 수 없다. 그래서 후보를
 * 하나씩 끄고 켤 수 있게 해 두고, 기기에서 직접 비교한다.
 *
 * 쓰는 법: 주소 뒤에 ?vt=off 처럼 붙이면 그 설정이 세션 동안 유지된다(SPA 안에서 주소가 바뀌어도
 * 남는다). ?vt=on 으로 되돌린다.
 *
 * - vt=off       라우트 전환(View Transition)을 걸지 않는다
 * - restore=off  뒤로가기 스크롤 복원을 하지 않는다
 * - blur=off     헤더의 backdrop-filter(배경 블러)를 끈다
 *
 * 원인을 찾으면 이 파일과 사용처를 걷어낸다.
 */

const FLAGS = ['vt', 'restore', 'blur'] as const;
type Flag = (typeof FLAGS)[number];

const KEY_PREFIX = 'debug:';

/** 주소의 ?flag=off|on 을 읽어 세션에 새긴다. 앱이 뜨기 전에 한 번 호출한다. */
export function readDebugFlags() {
  const params = new URLSearchParams(window.location.search);
  for (const flag of FLAGS) {
    const value = params.get(flag);
    if (value !== 'off' && value !== 'on') continue;
    try {
      sessionStorage.setItem(KEY_PREFIX + flag, value);
    } catch {
      // 프라이빗 모드 등 sessionStorage 불가 — 스위치만 못 쓸 뿐 앱은 정상 동작한다.
    }
  }
  if (!isEnabled('blur')) document.documentElement.setAttribute('data-no-blur', '');
}

/** 해당 기능이 켜져 있는지. 스위치를 건드린 적이 없으면 기본값은 켜짐이다. */
export function isEnabled(flag: Flag): boolean {
  try {
    return sessionStorage.getItem(KEY_PREFIX + flag) !== 'off';
  } catch {
    return true;
  }
}
