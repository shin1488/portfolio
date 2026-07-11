import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { scrollElementToTop } from '@/lib/section';

// 새로고침 스크롤 복원용 sessionStorage 키 접두사(경로별로 저장). in-memory Map은
// 새로고침 시 사라지므로, 새로고침 복원만 세션 스토리지로 따로 유지한다.
const SESSION_PREFIX = 'sm-scroll:';

/**
 * 라우트 이동 시 스크롤·포커스를 관리한다.
 * - hash 앵커가 있으면 그 섹션으로, 없으면(라우트 전환) 최상단으로 이동한다.
 * - 뒤로/앞으로가기(POP)는 직접 저장해 둔 스크롤 위치로 복원한다.
 *
 * 왜 수동 복원인가: 브라우저의 자동 스크롤 복원(scrollRestoration:auto)은 URL에 #hash가
 * 있으면 저장된 스크롤 위치 대신 그 앵커(#profile=최상단)로 점프해버려, 프로젝트 상세에서
 * 뒤로가기하면 보던 위치가 아니라 맨 위로 튄다. 그래서 restoration을 manual로 두고
 * 히스토리 항목(location.key)별 스크롤 위치를 우리가 저장했다가 POP에서 되돌린다.
 */
export function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  // 메인 effect가 같은 location.key로 재실행(StrictMode 마운트 이중 호출)될 때 중복 처리를
  // 막고, 첫 실행을 '초기 로드'로 판별한다(null이면 최초). 안 그러면 StrictMode의 두 번째
  // 실행이 초기 로드를 네비게이션으로 오인해 scrollTo(0)가 새로고침 복원을 덮어쓴다.
  const lastHandledKey = useRef<string | null>(null);
  // location.key -> 그 항목에서 마지막으로 본 scrollY
  const positions = useRef<Map<string, number>>(new Map());
  const currentKey = useRef(location.key);

  // 브라우저 자동 복원을 끈다(위 설명대로 #hash와 충돌). 초기 로드/새로고침의 복원은
  // 이 effect가 실행되기 전(브라우저 시점)에 이미 끝나므로 영향받지 않는다.
  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // 스크롤 위치를 기록한다. in-memory Map은 POP(뒤로/앞으로) 복원용, sessionStorage(경로별)는
  // 새로고침 복원용. sessionStorage 쓰기는 스로틀하고, 언로드 직전 pagehide로 최종값을 보정한다.
  useEffect(() => {
    let lastSave = 0;
    const saveSession = () => {
      try {
        sessionStorage.setItem(SESSION_PREFIX + window.location.pathname, String(window.scrollY));
      } catch {
        // 프라이빗 모드 등 sessionStorage 불가 — 새로고침 복원만 포기, 나머지는 정상 동작.
      }
    };
    const onScroll = () => {
      positions.current.set(currentKey.current, window.scrollY);
      const now = Date.now();
      if (now - lastSave > 200) {
        lastSave = now;
        saveSession();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', saveSession);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', saveSession);
    };
  }, []);

  // currentKey는 페인트 전(useLayoutEffect)에 갱신한다. 라우트 전환으로 문서가 줄면(예: 상세
  // 페이지 lazy 로딩 fallback) 브라우저가 스크롤을 ≈0으로 클램프하며 scroll 이벤트를 쏘는데,
  // 이 이벤트는 페인트 전에 처리된다. currentKey가 페인트 이후 useEffect에서만 갱신되면 그
  // 클램프 스크롤이 '아직 옛(떠나는) 키'에 ≈0으로 저장돼, 뒤로가기 복원이 최상단으로 튄다.
  // 페인트 전에 새(도착) 키로 바꿔두면 그 클램프는 도착 항목에 저장돼 무해하다.
  useLayoutEffect(() => {
    currentKey.current = location.key;
  }, [location.key]);

  useEffect(() => {
    // 같은 location.key로의 재실행(StrictMode 이중 호출)은 무시. 최초(null)면 초기 로드.
    if (lastHandledKey.current === location.key) return;
    const isInitialLoad = lastHandledKey.current === null;
    lastHandledKey.current = location.key;

    // 상세 → 목록 복귀: 특정 프로젝트 구간으로 되돌리는 건 ProjectsSection이 담당하므로 양보한다.
    // (여기서 앵커 스크롤을 하면 최상단으로 갔다가 다시 튀는 이중 스크롤이 생긴다)
    const state = location.state as { focusProjectIndex?: number } | null;
    if (typeof state?.focusProjectIndex === 'number') {
      return;
    }

    // 새로고침 복원: 세션에 저장해 둔 위치로 되돌린다. 상세 페이지는 lazy 청크 로딩 탓에
    // 브라우저 기본 복원이 (문서가 짧을 때 클램프돼) 실패하므로, 문서가 충분히 커질 때까지
    // 재시도하고, 사용자가 스크롤/터치/키로 개입하면 즉시 중단한다(다투지 않음). hash가 있으면
    // 앵커 이동이 우선. 진짜 새로고침(reload)만 — 새 진입/링크 열기(navigate)에선 복원 안 함.
    if (isInitialLoad && !location.hash) {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      let saved = NaN;
      if (nav?.type === 'reload') {
        try {
          saved = Number(sessionStorage.getItem(SESSION_PREFIX + location.pathname));
        } catch {
          saved = NaN;
        }
      }
      if (saved > 0) {
        let cancelled = false;
        const abort = () => {
          cancelled = true;
        };
        const passiveOnce = { once: true, passive: true } as const;
        window.addEventListener('wheel', abort, passiveOnce);
        window.addEventListener('touchstart', abort, passiveOnce);
        window.addEventListener('keydown', abort, { once: true });
        const cleanup = () => {
          window.removeEventListener('wheel', abort);
          window.removeEventListener('touchstart', abort);
          window.removeEventListener('keydown', abort);
        };
        const restore = (attempt: number) => {
          if (cancelled) return cleanup();
          window.scrollTo({ top: saved, behavior: 'instant' });
          // 아직 문서가 짧으면(청크 로딩 전) 목표에 못 미침 — 커질 때까지 최대 ~1.5s 재시도.
          if (window.scrollY < saved - 1 && attempt < 90) {
            requestAnimationFrame(() => restore(attempt + 1));
          } else {
            cleanup();
          }
        };
        restore(0);
        return;
      }
    }

    // 뒤로/앞으로가기: 저장해 둔 위치로 직접 복원한다(브라우저의 #hash 앵커 점프를 덮어쓴다).
    // 최초 진입도 POP으로 보고되므로 진짜 히스토리 이동만 복원한다.
    if (navigationType === 'POP' && !isInitialLoad) {
      const saved = positions.current.get(location.key) ?? 0;
      // 핀 트랙 높이 계산 전이라 문서가 아직 짧으면 목표에 못 미칠 수 있어 몇 프레임 재시도한다.
      const restore = (attempt: number) => {
        window.scrollTo({ top: saved, behavior: 'instant' });
        if (window.scrollY < saved - 1 && attempt < 10) {
          requestAnimationFrame(() => restore(attempt + 1));
        }
      };
      restore(0);
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
      // 앵커 대상이 아직 렌더 전일 수 있어(지연 로드·일시 오류 후 복구 등) 몇 프레임 재시도한다.
      // 끝내 못 찾아도 최상단 리셋으로 덮지 않는다 — hash 내비게이션의 의도는 '그 섹션'이므로.
      const tryScroll = (attempt: number) => {
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
        } else if (attempt < 10) {
          requestAnimationFrame(() => tryScroll(attempt + 1));
        }
      };
      tryScroll(0);
      return;
    }
    // 라우트 전환의 최상단 리셋은 smooth 글라이드 없이 즉시 이동한다.
    if (!isInitialLoad) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    // location.key는 같은 주소로의 재이동에서도 바뀌므로 매 네비게이션마다 실행된다.
  }, [location.key, navigationType]);
  return null;
}
