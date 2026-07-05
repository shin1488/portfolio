import type { CSSProperties } from 'react';
import { scrollToHeading } from '@/lib/section';
import type { TocEntry } from '@/lib/toc';

interface TableOfContentsProps {
  entries: TocEntry[];
}

/** 상세 페이지 상단 목차 — 최상위 섹션(#)을 번호와 함께 나열, 클릭 시 해당 섹션으로 이동 */
export function TableOfContents({ entries }: TableOfContentsProps) {
  if (entries.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label="목차"
      className="rounded-2xl border border-zinc-200 bg-linear-to-b from-zinc-50 to-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:from-white/[0.05] dark:to-white/[0.02] dark:shadow-xl dark:shadow-black/20 dark:backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="size-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
        </svg>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          목차
        </p>
      </div>

      {/* 열 우선 배치 — 왼쪽 열에 앞 절반, 오른쪽 열에 뒤 절반이 위→아래로 채워진다 */}
      <ol
        className="mt-4 grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-flow-col sm:grid-cols-2 sm:[grid-template-rows:repeat(var(--toc-rows),auto)]"
        style={{ '--toc-rows': Math.ceil(entries.length / 2) } as CSSProperties}
      >
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              onClick={(event) => {
                // 히스토리에 해시를 쌓지 않고 스크롤만 — 뒤로가기가 섹션 순회가 아니라 페이지 이탈이 되도록.
                event.preventDefault();
                scrollToHeading(entry.id);
              }}
              className="group flex items-baseline gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            >
              <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-400 group-hover:text-indigo-500 dark:text-zinc-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-zinc-700 group-hover:text-indigo-600 dark:text-zinc-300 dark:group-hover:text-indigo-300">
                {entry.text}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
