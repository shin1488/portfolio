import { cn } from '@/lib/cn';
import { scrollToHeading } from '@/lib/section';
import { useActiveHeadingId, useScrollProgress } from '@/lib/useScroll';
import type { TocEntry } from '@/lib/toc';

interface ReadingAidsProps {
  entries: TocEntry[];
}

/**
 * 긴 상세 페이지용 리딩 보조 — 왼쪽 진행 바, 오른쪽 미니 목차(현재 섹션 강조),
 * 우하단 맨 위로 버튼(일정 스크롤 후 노출). 모두 fixed, 데스크톱 위주로 노출.
 */
export function ReadingAids({ entries }: ReadingAidsProps) {
  const { progress, scrolled } = useScrollProgress();
  const { activeId, select } = useActiveHeadingId(entries.map((entry) => entry.id));

  if (entries.length < 2) {
    return null;
  }

  return (
    <>
      {/* 왼쪽 스크롤 진행 바 — 본문(max-w-3xl=48rem) 왼쪽 바깥 약 4rem 지점에 배치(뷰포트 끝 X) */}
      <div
        aria-hidden="true"
        style={{ left: 'max(1rem, calc(50% - 28rem))' }}
        className="fixed top-1/2 z-30 hidden h-[40vh] w-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-zinc-200/50 lg:block dark:bg-zinc-800/60"
      >
        <div
          className="w-full rounded-full bg-linear-to-b from-indigo-500 to-pink-500"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {/* 오른쪽 미니 목차 — 본문 오른쪽 바깥 약 1.5rem 지점에서 오른쪽으로 펼침 */}
      <nav
        aria-label="섹션 바로가기"
        style={{ left: 'calc(50% + 28rem)' }}
        className="fixed top-1/2 z-30 hidden max-h-[76vh] -translate-y-1/2 overflow-y-auto 2xl:block"
      >
        <ul className="space-y-0.5">
          {entries.map((entry) => {
            const active = entry.id === activeId;
            return (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  onClick={(event) => {
                    // 히스토리에 해시를 쌓지 않고 스크롤만 — 뒤로가기가 섹션 순회가 아니라 페이지 이탈이 되도록.
                    event.preventDefault();
                    select(entry.id); // 클릭한 항목을 고정 강조 — 바닥 근처 섹션도 마지막으로 안 튀게
                    scrollToHeading(entry.id);
                  }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md py-1 pl-3 pr-2 text-xs transition-colors',
                    active
                      ? 'font-medium text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-px shrink-0 transition-all',
                      active ? 'w-5 bg-indigo-500' : 'w-2.5 bg-zinc-400/60 dark:bg-zinc-600',
                    )}
                  />
                  <span className="line-clamp-1 max-w-[10.5rem]">{entry.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 우하단 맨 위로 버튼 */}
      <button
        type="button"
        aria-label="맨 위로"
        onClick={() => {
          select(entries[0].id); // 맨 위로 갈 땐 첫 항목을 강조(고정 해제 겸)
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={cn(
          'fixed bottom-6 right-6 z-30 flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800',
          scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
