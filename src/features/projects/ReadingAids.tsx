import { useEffect, useState } from 'react';
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
        className="fixed top-1/2 z-30 hidden h-[40vh] w-0.75 -translate-y-1/2 overflow-hidden rounded-full bg-zinc-200/50 lg:block dark:bg-zinc-800/60"
      >
        <div
          className="w-full rounded-full bg-linear-to-b from-accent to-accent-end"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {/* 미니 목차(좁은 화면 lg~2xl) — 본문 옆에 펼칠 공간이 없을 때. 평소엔 우측 끝에 틱만,
         마우스를 대면 라벨이 왼쪽으로 펼쳐져 클릭할 수 있다(감지 영역은 pl로 조금 넉넉히).
         큰 화면(2xl+)에선 아래의 펼쳐진 미니 목차가 대신 뜬다. */}
      <nav
        aria-label="섹션 바로가기"
        className="group fixed right-0 top-1/2 z-30 hidden max-h-[85vh] -translate-y-1/2 flex-col items-end gap-0.5 overflow-y-auto rounded-l-2xl border border-transparent py-3 pl-8 pr-3 transition-colors group-hover:border-zinc-200 group-hover:bg-white/80 group-hover:shadow-xl group-hover:backdrop-blur-md lg:flex 2xl:hidden dark:group-hover:border-zinc-800 dark:group-hover:bg-zinc-950/80"
      >
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              onClick={(event) => {
                // 히스토리에 해시를 쌓지 않고 스크롤만 — 뒤로가기가 섹션 순회가 아니라 페이지 이탈이 되도록.
                event.preventDefault();
                select(entry.id); // 클릭한 항목을 고정 강조 — 바닥 근처 섹션도 마지막으로 안 튀게
                scrollToHeading(entry.id);
              }}
              aria-current={active ? 'true' : undefined}
              className="flex w-full items-center justify-end rounded-md py-1 pr-0.5 hover:bg-zinc-500/10"
            >
              {/* 라벨 — 평소 max-w-0(숨김), rail hover 시 왼쪽으로 펼침. 활성은 좌측 인디고 시작 그라데이션 */}
              <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-60 group-hover:opacity-100">
                <span
                  className={cn(
                    'block truncate pr-2.5 text-[13px]',
                    active
                      ? 'bg-linear-to-r from-accent to-accent-end bg-clip-text font-medium text-transparent'
                      : 'text-zinc-500 dark:text-zinc-400',
                  )}
                >
                  {entry.text}
                </span>
              </span>
              {/* 틱 — 우측 끝. 라벨(인디고→핑크)의 오른쪽에 붙는 배치라, 그라데이션 끝색인
                  핑크 통색으로 둬야 색이 이어진다(2xl+ 목차는 틱이 왼쪽이라 반대로 인디고). */}
              <span
                aria-hidden="true"
                className={cn(
                  'h-0.5 shrink-0 rounded-full transition-all',
                  active ? 'w-5 bg-accent-end' : 'w-2.5 bg-zinc-400/60 dark:bg-zinc-600',
                )}
              />
            </a>
          );
        })}
      </nav>

      {/* 미니 목차(넓은 화면 2xl+) — 본문 오른쪽 바깥 여백에 라벨까지 상시 펼쳐 노출 */}
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
                    event.preventDefault();
                    select(entry.id);
                    scrollToHeading(entry.id);
                  }}
                  aria-current={active ? 'true' : undefined}
                  className="group/item flex items-center gap-2.5 rounded-md py-1 pl-3 pr-2 text-[13px]"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-px shrink-0 transition-all',
                      active ? 'w-5 bg-accent' : 'w-2.5 bg-zinc-400/60 dark:bg-zinc-600',
                    )}
                  />
                  {/* 회색 라벨과 그라데이션 라벨을 겹쳐 두고 활성 시 그라데이션만 opacity로 페이드(깜빡임 없음) */}
                  <span className="grid">
                    <span className="col-start-1 row-start-1 line-clamp-1 max-w-42 text-zinc-400 transition-colors group-hover/item:text-zinc-700 dark:text-zinc-500 dark:group-hover/item:text-zinc-200">
                      {entry.text}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'col-start-1 row-start-1 line-clamp-1 max-w-42 bg-linear-to-r from-accent to-accent-end bg-clip-text text-transparent transition-opacity',
                        active ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {entry.text}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

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
            'group fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 flex size-11 items-center justify-center text-zinc-700 transition-all duration-300 dark:text-zinc-200',
            fabShown && scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-zinc-200 bg-white/80 shadow-lg backdrop-blur-md transition-colors group-hover:bg-zinc-100 supports-[-webkit-touch-callout:none]:bg-white/95 supports-[-webkit-touch-callout:none]:backdrop-blur-none dark:border-zinc-700 dark:bg-zinc-900/80 dark:group-hover:bg-zinc-800 dark:supports-[-webkit-touch-callout:none]:bg-zinc-900/95"
          />
          <svg viewBox="0 0 24 24" className="relative size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  );
}
