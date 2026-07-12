import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/lib/nav';
import { scrollToSection, useActiveSection } from '@/lib/section';

/**
 * 우측 고정 섹션 rail(스크롤 스파이) — 현재 섹션을 틱으로 표시하고 클릭 시 그 섹션으로 이동한다.
 * 상세 페이지의 미니 목차(ReadingAids)와 같은 규격: 평소엔 틱만 보이고, rail에 마우스를 대면
 * 라벨이 왼쪽으로 펼쳐지며 패널 배경이 깔린다. 활성 항목은 틱이 길어지고 라벨에 액센트
 * 그라데이션이 걸린다. 1080px 이하에서는 숨긴다.
 */
export function SectionRail() {
  const ids = NAV_ITEMS.map((item) => item.id);
  const active = useActiveSection(ids);

  // 패널 배경·테두리는 group-hover가 아니라 hover로 건다 — group이 붙은 요소 자신에게
  // group-hover:를 걸면 자손 선택자가 되어 절대 매치되지 않는다(라벨 펼침은 자손이라 group-hover 유지).
  return (
    <nav
      aria-label="섹션 이동"
      className="group fixed right-0 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-0.5 rounded-l-2xl border border-transparent py-3 pl-8 pr-3 transition-colors hover:border-divider hover:bg-zinc-950/80 hover:backdrop-blur-md min-[1081px]:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            aria-current={isActive}
            className="flex w-full cursor-pointer items-center justify-end rounded-md py-1 pr-0.5 hover:bg-zinc-500/10"
          >
            {/* 라벨 — 평소 max-w-0(숨김), rail hover 시 왼쪽으로 펼쳐진다 */}
            <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-60 group-hover:opacity-100">
              <span
                className={cn(
                  'block truncate pr-2.5 font-mono text-[11px]',
                  isActive
                    ? 'bg-linear-to-r from-accent to-accent-end bg-clip-text font-medium text-transparent'
                    : 'text-zinc-400',
                )}
              >
                {item.label}
              </span>
            </span>
            {/* 틱 — 우측 끝. 라벨(accent→accent-end)의 오른쪽에 붙는 배치라 그라데이션 끝색인
                accent-end 통색으로 둬야 색이 이어진다. */}
            <span
              aria-hidden="true"
              className={cn(
                'h-0.5 shrink-0 rounded-full transition-all',
                isActive ? 'w-5 bg-accent-end' : 'w-2.5 bg-zinc-600',
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
