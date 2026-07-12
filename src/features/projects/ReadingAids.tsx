import { useEffect, useState } from 'react';
import { SideRail } from '@/components/ui/SideRail';
import { cn } from '@/lib/cn';
import { scrollToHeading } from '@/lib/section';
import { useActiveHeadingId, useScrollProgress } from '@/lib/useScroll';
import type { TocEntry } from '@/lib/toc';

interface ReadingAidsProps {
  entries: TocEntry[];
}

/**
 * 긴 상세 페이지용 리딩 보조 — 왼쪽 진행 바, 오른쪽 목차 rail(현재 섹션 강조),
 * 우하단 맨 위로 버튼(일정 스크롤 후 노출). 모두 fixed, 데스크톱 위주로 노출.
 * 목차 rail은 홈의 섹션 rail과 같은 SideRail을 쓴다.
 */
export function ReadingAids({ entries }: ReadingAidsProps) {
  const { progress, scrolled } = useScrollProgress();
  const { activeId, select } = useActiveHeadingId(entries.map((entry) => entry.id));

  // FAB 2단계 마운트 — 숨김을 opacity/visibility로만 하면 iOS 26 Safari가 하단에 남아 있는
  // fixed+backdrop-filter 레이어를 보고 하단 바 글래스를 불투명 단색으로 플래튼시킨다
  // (MobileDrawer와 같은 규칙: 안 보일 땐 렌더 트리에서 완전히 제거해야 한다).
  // mounted로 마운트를 만들고 double-rAF 뒤 shown을 켜 등장 트랜지션을 유지한다.
  const [fabMounted, setFabMounted] = useState(false);
  const [fabShown, setFabShown] = useState(false);
  useEffect(() => {
    if (scrolled) {
      setFabMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setFabShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setFabShown(false);
    const timer = setTimeout(() => setFabMounted(false), 300);
    return () => clearTimeout(timer);
  }, [scrolled]);

  if (entries.length < 2) {
    return null;
  }

  return (
    <>
      {/* 왼쪽 스크롤 진행 바 — 본문(max-w-3xl=48rem) 왼쪽 바깥 약 4rem 지점에 배치(뷰포트 끝 X) */}
      <div
        aria-hidden="true"
        style={{ left: 'max(1rem, calc(50% - 28rem))' }}
        className="fixed top-1/2 z-30 hidden h-[40vh] w-0.75 -translate-y-1/2 overflow-hidden rounded-full bg-zinc-800/60 lg:block"
      >
        <div
          className="w-full rounded-full bg-linear-to-b from-accent to-accent-end"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      <SideRail
        ariaLabel="섹션 바로가기"
        items={entries.map((entry) => ({ id: entry.id, label: entry.text }))}
        activeId={activeId}
        onSelect={(id) => {
          select(id); // 클릭한 항목을 고정 강조 — 바닥 근처 섹션도 마지막으로 안 튀게
          scrollToHeading(id);
        }}
        // 상세 본문은 max-w-3xl(48rem)이라 우측 경계가 50%+24rem — 홈보다 안쪽에 붙는다
        expandedOffsetRem={28}
      />

      {/* 우하단 맨 위로 버튼 — 배경은 fixed 요소 자체가 아닌 absolute 자식에
          (iOS 26 Safari가 하단 fixed 요소의 배경색으로 하단 바를 칠하는 것 회피).
          blur는 iOS(-webkit-touch-callout 지원 환경)에서만 끄고 불투명도로 보상 —
          하단 바 영역의 backdrop-filter가 바 글래스를 검정 단색으로 플래튼시키기 때문. */}
      {fabMounted && (
        <button
          type="button"
          aria-label="맨 위로"
          onClick={() => {
            select(entries[0].id); // 맨 위로 갈 땐 첫 항목을 강조(고정 해제 겸)
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={cn(
            'group fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 flex size-11 cursor-pointer items-center justify-center text-zinc-200 transition-all duration-300',
            fabShown && scrolled
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0',
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-divider bg-zinc-900/80 shadow-lg backdrop-blur-md transition-colors group-hover:bg-zinc-800 supports-[-webkit-touch-callout:none]:bg-zinc-900 supports-[-webkit-touch-callout:none]:backdrop-blur-none"
          />
          <svg
            viewBox="0 0 24 24"
            className="relative size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  );
}
