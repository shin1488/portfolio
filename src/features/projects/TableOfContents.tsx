import { useState } from 'react';
import { cn } from '@/lib/cn';
import { scrollToHeading } from '@/lib/section';
import type { TocEntry } from '@/lib/toc';

interface TableOfContentsProps {
  entries: TocEntry[];
  /** 처음에 펼친 상태로 둘지. 기본은 접힘. */
  defaultOpen?: boolean;
}

/**
 * 상세 페이지 상단 접이식 목차.
 * 헤더: [아이콘 + "목차"] ── [펼치기/접기 텍스트 + 셰브론]. 개수 배지 없음.
 * 접힘/펼침은 grid-template-rows 0fr↔1fr 로 부드럽게 높이 애니메이션.
 * 호버 시 번호는 인디고, 제목은 인디고→핑크 그라데(현행 규약 유지).
 *
 * 이 컴포넌트는 자체 구분선을 그리지 않는다(위/아래 border 없음) — 접힌 상태에서
 * 주변 divider와 겹쳐 이중선으로 보이는 걸 막기 위함. 본문 상단 divider
 * (마크다운 래퍼의 border-t) 하나만 목차 아래 경계를 담당한다.
 */
export function TableOfContents({ entries, defaultOpen = false }: TableOfContentsProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (entries.length < 2) {
    return null;
  }

  return (
    <nav aria-label="목차">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="toc-list"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-1.5"
      >
        <span className="flex items-center gap-2.5">
          <svg
            viewBox="0 0 24 24"
            className="size-6 text-indigo-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
          </svg>
          <span className="text-base font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
            목차
          </span>
        </span>

        <span className="flex items-center gap-2">
          <span className="text-sm text-zinc-400 dark:text-zinc-500">
            {open ? '접기' : '펼치기'}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={cn(
              'size-5 text-zinc-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:text-zinc-500',
              open && 'rotate-180',
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* 높이 애니메이션: 0fr ↔ 1fr */}
      <div
        id="toc-list"
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <ol className="pb-1.5 pt-0.5">
            {entries.map((entry, index) => (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  tabIndex={open ? 0 : -1}
                  onClick={(event) => {
                    // 히스토리에 해시를 쌓지 않고 스크롤만 — 뒤로가기가 섹션 순회가 아니라 페이지 이탈이 되도록.
                    event.preventDefault();
                    scrollToHeading(entry.id);
                  }}
                  className="group flex items-baseline gap-3.5 py-2.5"
                >
                  <span className="w-4.5 shrink-0 font-mono text-[13px] tabular-nums text-zinc-400 transition-colors group-hover:text-indigo-500 dark:text-zinc-500">
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
      </div>
    </nav>
  );
}
