import { useEffect, useState } from 'react';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { ScrollTopButton } from '@/components/ui/ScrollTopButton';
import { SideRail } from '@/components/ui/SideRail';
import { scrollToHeading } from '@/lib/section';
import { useActiveHeadingId, useScrolledPast } from '@/lib/useScroll';
import type { TocEntry } from '@/lib/toc';

interface ReadingAidsProps {
  entries: TocEntry[];
}

/**
 * 긴 상세 페이지용 리딩 보조 — 왼쪽 진행 바, 오른쪽 목차 rail(현재 섹션 강조),
 * 우하단 맨 위로 버튼(일정 스크롤 후 노출). 모두 fixed, 데스크톱 위주로 노출.
 * 목차 rail·진행 바·맨 위로 버튼은 홈·팝업과 같은 공용 컴포넌트를 쓴다.
 */
export function ReadingAids({ entries }: ReadingAidsProps) {
  const scrolled = useScrolledPast();
  const { activeId, select } = useActiveHeadingId(entries.map((entry) => entry.id));

  // FAB 2단계 마운트 — 숨김을 opacity/visibility로만 하면 iOS 26 Safari가 하단에 남아 있는
  // fixed+backdrop-filter 레이어를 보고 하단 바 글래스를 불투명 단색으로 플래튼시킨다
  // (MobileDrawer와 같은 규칙: 안 보일 땐 렌더 트리에서 완전히 제거해야 한다).
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
      <ScrollProgressBar
        orientation="y"
        className="fixed left-[max(1rem,calc(50%-28rem))] top-1/2 z-30 hidden h-[40vh] -translate-y-1/2 rounded-full lg:block"
      />

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

      {fabMounted && (
        <ScrollTopButton
          visible={fabShown && scrolled}
          onClick={() => {
            select(entries[0].id); // 맨 위로 갈 땐 첫 항목을 강조(고정 해제 겸)
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30"
        />
      )}
    </>
  );
}
