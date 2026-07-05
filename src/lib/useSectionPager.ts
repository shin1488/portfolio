import { useEffect } from 'react';
import { isProgrammaticScroll } from './section';

// 섹션 전환 애니메이션 길이(ms). 스냅 직후 GUARD 동안은 '자동' 재스냅만 억제한다(wheel은 안 막음).
const DURATION = 320;
const GUARD = 160;
// ease-out: 들어오던 스크롤 속도에 가깝게 빠르게 시작해 감속하며 착지 → 가로챌 때 급브레이크(걸림)를 없앤다.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface Range {
  id: string;
  enter: number; // 이 섹션이 첫 항목으로 정지하는 scrollY
  exit: number; // 마지막 항목으로 정지하는 scrollY
}

/**
 * 섹션 사이(핀 트랙이 릴리스되는 1뷰포트짜리 전환 구간)에서 정지하지 못하게 하는 페이저.
 *
 * 각 섹션은 [enter, exit] 정지 구간을 갖는다(핀 트랙이 pin된 스크롤 범위). 그 안에서는
 * 네이티브 스크롤로 항목을 하나씩 넘기게 그대로 둔다. 섹션과 섹션 사이 gap에 들어서면
 * wheel을 preventDefault해 관성을 끊고, 진행 방향의 인접 섹션 가장자리로 붙인다.
 *
 * - 마지막 섹션 뒤 꼬리(= 푸터 영역)는 스냅하지 않는다 → 끝까지 내려 푸터를 볼 수 있다.
 * - 스냅 직후 COOLDOWN 동안 잠가, 잔여 관성이 반대로 다시 스냅하는 '왔다갔다'를 막는다.
 * - 데스크톱(핀 레이아웃, sm+)에서만 동작하고, 헤더·rail 등 프로그램적 스크롤 중엔 비켜난다.
 */
export function useSectionPager(ids: string[]) {
  const key = ids.join('|');

  useEffect(() => {
    if (ids.length < 2) return;
    const isDesktop = () => window.matchMedia('(min-width: 640px)').matches;
    const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 각 섹션의 정지 구간을 실측으로 계산(리사이즈에 따라 갱신).
    let ranges: Range[] = [];
    const measure = () => {
      const innerH = window.innerHeight;
      ranges = ids
        .map((id): Range | null => {
          const el = document.getElementById(id);
          if (!el) return null;
          const top = window.scrollY + el.getBoundingClientRect().top;
          return { id, enter: Math.round(top), exit: Math.round(top + el.offsetHeight - innerH) };
        })
        .filter((r): r is Range => r !== null);
      // 첫 섹션(히어로)은 페이지 최상단 한 점으로 둔다. [0,56]처럼 얇은 구간을 남기면
      // 위로 스냅이 그 아래 가장자리(56)에 안착해 최상단까지 56px 죽은 구간이 생겨 '두 번 걸리는' 느낌이 난다.
      if (ranges.length) {
        ranges[0].enter = 0;
        ranges[0].exit = 0;
      }
    };

    // scrollY가 속한 구간 index, 없으면 -1(= 구간 사이 gap).
    const rangeIndexAt = (y: number) => {
      for (let i = 0; i < ranges.length; i++) {
        if (y >= ranges[i].enter - 1 && y <= ranges[i].exit + 1) return i;
      }
      return -1;
    };

    // gap에 있을 때 방향(dir>0 아래)에 맞는 스냅 타겟. 섹션 사이가 아니면(마지막 섹션 뒤 꼬리=
    // 푸터, 또는 첫 섹션 앞) null → 스냅하지 않고 자유 스크롤.
    const gapTarget = (y: number, dir: number): number | null => {
      let below = -1;
      let above = -1;
      for (let i = 0; i < ranges.length; i++) {
        if (ranges[i].exit < y) below = i;
        if (ranges[i].enter > y && above === -1) above = i;
      }
      if (above === -1 || below === -1) return null; // 첫 섹션 앞 / 마지막 섹션 뒤(푸터)
      return dir > 0 ? ranges[above].enter : ranges[below].exit;
    };

    let animating = false;
    let raf = 0;
    // 마운트(뒤로가기 POP 복귀 포함) 직후 잠깐은 자동(스크롤 안전망) 스냅을 멈춰,
    // 브라우저의 스크롤 위치 복원이 페이저 스냅에 덮여 섹션 경계로 튀지 않게 둔다.
    let guardUntil = Date.now() + 700;

    const animateTo = (target: number) => {
      const start = window.scrollY;
      if (Math.abs(target - start) < 1) return;
      if (reduce()) {
        window.scrollTo({ top: target, behavior: 'instant' });
        guardUntil = Date.now() + GUARD;
        return;
      }
      cancelAnimationFrame(raf);
      animating = true;
      const dist = target - start;
      let startTs = 0;
      const stepFrame = (ts: number) => {
        if (!startTs) startTs = ts;
        const t = Math.min(1, (ts - startTs) / DURATION);
        window.scrollTo({ top: Math.round(start + dist * easeOutCubic(t)), behavior: 'instant' });
        if (t < 1) raf = requestAnimationFrame(stepFrame);
        else {
          // 착지 즉시 wheel은 풀어(빠른 스크롤러를 붙잡지 않음) 자유 스크롤을 잇게 하고,
          // 자동(스크롤 안전망) 재스냅만 잠깐 억제해 잔여 관성으로 인한 반대 스냅을 막는다.
          animating = false;
          guardUntil = Date.now() + GUARD;
        }
      };
      raf = requestAnimationFrame(stepFrame);
    };

    // wheel: 관성을 끊는 유일한 지점(non-passive + preventDefault).
    const onWheel = (e: WheelEvent) => {
      if (!isDesktop()) return;
      if (animating) {
        e.preventDefault(); // 전환·쿨다운 중 새 입력·관성 차단
        return;
      }
      if (isProgrammaticScroll()) return;
      const dir = e.deltaY;
      if (dir === 0) return;
      const y = window.scrollY;
      const idx = rangeIndexAt(y);
      if (idx !== -1) {
        const r = ranges[idx];
        // 구간 가장자리에서 밖으로 나가려는 wheel이면 가로채 다음/이전 섹션으로 넘긴다.
        if (dir > 0 && y >= r.exit - 1 && idx < ranges.length - 1) {
          e.preventDefault();
          animateTo(ranges[idx + 1].enter);
        } else if (dir < 0 && y <= r.enter + 1 && idx > 0) {
          e.preventDefault();
          animateTo(ranges[idx - 1].exit);
        }
        return; // 구간 내부 → 네이티브 스크롤로 항목 넘김
      }
      // gap: 섹션 사이면 스냅, 푸터 꼬리면 그대로 네이티브 스크롤(preventDefault 안 함).
      const target = gapTarget(y, dir > 0 ? 1 : -1);
      if (target !== null) {
        e.preventDefault();
        animateTo(target);
      }
    };

    // 스크롤바 드래그·키보드 등 wheel을 안 쓰는 경로의 안전망.
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dir = y - lastY;
      lastY = y;
      if (animating || Date.now() < guardUntil || !isDesktop() || isProgrammaticScroll()) return;
      if (Math.abs(dir) < 3) return; // 미세 흔들림 무시
      if (rangeIndexAt(y) !== -1) return;
      const target = gapTarget(y, dir > 0 ? 1 : -1);
      if (target !== null) animateTo(target);
    };

    // 스크롤바를 gap에서 놓았을 때(위치 변화 없어 scroll이 안 뜨는 경우)까지 잡는다.
    const onScrollEnd = () => {
      if (animating || Date.now() < guardUntil || !isDesktop() || isProgrammaticScroll()) return;
      if (rangeIndexAt(window.scrollY) !== -1) return;
      const target = gapTarget(window.scrollY, window.scrollY >= lastY ? 1 : -1);
      if (target !== null) animateTo(target);
    };

    measure();
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScrollEnd, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
