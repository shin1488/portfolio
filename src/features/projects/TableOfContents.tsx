import { useState } from 'react';
import { cn } from '@/lib/cn';
import { scrollToHeading } from '@/lib/section';
import type { TocEntry } from '@/lib/toc';

interface TableOfContentsProps {
  entries: TocEntry[];
}

/**
 * 상세 페이지 상단 목차 — 무박스(겉 카드 제거, 개수 표시 없음), 기본 접힘.
 * 헤더(아이콘 + "목차" + 우측 V 화살표)를 누르면 1열 divide-y 리스트가 펼쳐진다.
 * 호버 시 번호는 인디고, 제목은 인디고→핑크 그라데이션(현행 규약 유지).
 */
export function TableOfContents({ entries }: TableOfContentsProps) {
  const [open, setOpen] = useState(false); // 항목이 많으면 아래로 길게 늘어져서 접힘이 기본

  if (entries.length < 2) {
    return null;
  }

  return (
    <nav aria-label="목차">
      {/* 헤더 — 전체가 접기/펼치기 토글, 우측 끝 화살표가 상태를 표시 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="toc-list"
        className="flex w-full cursor-pointer items-center gap-2.5 border-b border-zinc-200 pb-3.5 dark:border-zinc-800"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5 text-indigo-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
          목차
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            'ml-auto size-4 text-zinc-400 transition-transform duration-300 dark:text-zinc-500',
            open && 'rotate-180',
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* 1열 divide-y 리스트 — grid rows 트랜지션으로 부드럽게 접힘/펼침 */}
      <div
        id="toc-list"
        className={cn(
          'grid transition-[grid-template-rows] duration-300',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ol className="overflow-hidden">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                onClick={(event) => {
                  // 히스토리에 해시를 쌓지 않고 스크롤만 — 뒤로가기가 섹션 순회가 아니라 페이지 이탈이 되도록.
                  event.preventDefault();
                  scrollToHeading(entry.id);
                }}
                tabIndex={open ? 0 : -1}
                className="group flex items-baseline gap-3.5 border-b border-zinc-100 py-3 dark:border-zinc-900"
              >
                <span className="w-[18px] shrink-0 font-mono text-[13px] tabular-nums text-zinc-400 transition-colors group-hover:text-indigo-500 dark:text-zinc-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[15px] text-zinc-700 group-hover:bg-linear-to-r group-hover:from-indigo-500 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent dark:text-zinc-300">
                  {entry.text}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
