import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/lib/nav';
import { scrollToSection, useActiveSection } from '@/lib/section';

/**
 * 우측 고정 섹션 rail(스크롤 스파이) — 현재 섹션을 틱으로 표시하고 클릭 시 그 섹션으로 이동.
 * 평소엔 틱만, rail hover 시 모노 라벨이 함께 나온다. 1080px 이하에서는 숨긴다.
 */
export function SectionRail() {
  const ids = NAV_ITEMS.map((item) => item.id);
  const active = useActiveSection(ids);

  return (
    <nav
      aria-label="섹션 이동"
      className="group fixed right-7 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-3.5 min-[1081px]:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            aria-current={isActive}
            className="relative flex cursor-pointer items-center"
          >
            <span
              className={cn(
                'absolute right-full mr-3 whitespace-nowrap font-mono text-[11px] transition-opacity duration-250 group-hover:opacity-100',
                isActive ? 'text-green-400 opacity-100' : 'text-zinc-400 opacity-0',
              )}
            >
              {item.label}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'h-px transition-all duration-250',
                isActive ? 'w-6.5 bg-green-400' : 'w-3.5 bg-zinc-700',
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
