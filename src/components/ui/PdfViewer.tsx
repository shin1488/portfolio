import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { cn } from '@/lib/cn';

// PDF.js 워커는 pdfjs-dist에서 번들한 것과 버전이 일치해야 한다(react-pdf가 고정한 버전).
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PdfViewerProps {
  href: string;
  title: string;
}

// 큰 ‹ › 튜토리얼 힌트가 작아지기까지, 전체화면 크롬이 숨기까지의 시간(ms)
const HINT_SHRINK_AFTER = 3000;
const CHROME_HIDE_AFTER = 2500;

/**
 * 발표자료(PDF)를 한 번에 한 슬라이드씩 보는 인라인 뷰어(PDF.js 기반).
 * 처음엔 첫 슬라이드 미리보기(재생 오버레이), 클릭하면 인터랙티브 모드로 전환된다.
 * 넘기기: 무대를 반으로 갈라 왼쪽 클릭=이전 / 오른쪽 클릭=다음(진입 직후 큰 ‹ › 힌트가
 * 잠시 떠서 조작을 알려주고 곧 작게 줄어든다), 키보드 ←/→, 하단 프로그레스 바(클릭 시크).
 * 전체화면: 잠시 뒤 상하 크롬이 숨고 슬라이드만 남는다 — 마우스를 움직이면 다시 나타나며
 * (키보드 입력엔 안 나타남), 숨김 동안엔 바닥에 얇은 진행 바만 깔린다.
 */
export default function PdfViewer({ href, title }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(0);
  const [stageH, setStageH] = useState(0);
  const [aspect, setAspect] = useState(0.5625); // 세로/가로 비율(기본 16:9). 페이지 로드 후 실제값
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [interactive, setInteractive] = useState(false); // false=첫 슬라이드 미리보기
  const [hintBig, setHintBig] = useState(true); // 진입 직후 큰 ‹ › 튜토리얼 힌트
  const [chromeVisible, setChromeVisible] = useState(true); // 전체화면 상하 크롬 표시 여부
  const chromeTimer = useRef(0);

  // 무대 크기를 추적한다(폭은 항상, 높이는 전체화면에서 화면에 맞추는 데 쓴다).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      setStageW(el.clientWidth);
      setStageH(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 인터랙티브 진입: 포커스(키보드 즉시 동작) + 잠시 뒤 큰 힌트를 작게 줄인다.
  useEffect(() => {
    if (!interactive) return;
    containerRef.current?.focus({ preventScroll: true });
    const t = window.setTimeout(() => setHintBig(false), HINT_SHRINK_AFTER);
    return () => window.clearTimeout(t);
  }, [interactive]);

  // 전체화면 상태 동기화 + 진입 시 재포커스, 나가면 크롬 항상 표시로 복귀.
  useEffect(() => {
    const onChange = () => {
      const on = document.fullscreenElement === containerRef.current;
      setIsFullscreen(on);
      if (on) containerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // 전체화면 크롬 자동 숨김 — 마우스가 멈추면 CHROME_HIDE_AFTER 뒤 숨긴다.
  const pokeChrome = () => {
    setChromeVisible(true);
    window.clearTimeout(chromeTimer.current);
    chromeTimer.current = window.setTimeout(() => setChromeVisible(false), CHROME_HIDE_AFTER);
  };
  useEffect(() => {
    if (isFullscreen) {
      pokeChrome();
    } else {
      window.clearTimeout(chromeTimer.current);
      setChromeVisible(true);
    }
    return () => window.clearTimeout(chromeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  const openInteractive = () => setInteractive(true);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const go = (delta: number) => {
    setHintBig(false); // 한 번이라도 넘기면 튜토리얼 힌트는 바로 축소
    setPage((p) => Math.min(numPages || 1, Math.max(1, p + delta)));
  };

  // 키보드 넘기기 — 전체화면 크롬은 마우스 움직임에만 반응하므로 여기선 깨우지 않는다.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
  };

  // 프로그레스 바 클릭 → 해당 위치 페이지로 이동.
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!numPages) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setPage(Math.min(numPages, Math.max(1, Math.ceil(frac * numPages) || 1)));
  };

  const canPrev = page > 1;
  const canNext = numPages > 0 && page < numPages;

  // 렌더 폭: 평소엔 무대 폭, 전체화면에선 높이에도 맞춰(화면 밖으로 안 넘치게) 축소.
  const renderW =
    isFullscreen && stageH > 0 && aspect > 0
      ? Math.min(stageW, Math.floor(stageH / aspect))
      : stageW;
  const shownPage = interactive ? page : 1;
  const progressPct = numPages > 0 ? (page / numPages) * 100 : 0;
  // 전체화면에서 크롬(상하 바)이 숨은 상태
  const chromeHidden = isFullscreen && !chromeVisible;

  return (
    <div
      ref={containerRef}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={interactive ? onKeyDown : undefined}
      onMouseMove={isFullscreen ? pokeChrome : undefined}
      aria-label={`${title} 슬라이드 뷰어`}
      className={cn(
        'not-prose overflow-hidden border border-zinc-200 bg-zinc-100 outline-none dark:border-zinc-800 dark:bg-zinc-900',
        isFullscreen ? 'relative flex h-screen w-screen flex-col rounded-none border-0' : 'rounded-xl',
        // 크롬 숨김 상태(전체화면) — PPT 발표 모드처럼 마우스 포인터까지 숨긴다
        chromeHidden && 'cursor-none',
      )}
    >
      {/* 상단 크롬 — 전체화면에선 무대 위에 겹치는 오버레이가 되어 숨김/등장 전환 */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 border-b border-zinc-200 px-3.5 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400',
          isFullscreen &&
            'absolute inset-x-0 top-0 z-10 border-zinc-800 bg-zinc-950/80 backdrop-blur-md transition-all duration-300',
          chromeHidden && 'pointer-events-none -translate-y-2 opacity-0',
        )}
      >
        <span className="truncate">{title}</span>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 no-underline hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          새 탭 ↗
        </a>
      </div>

      {/* 슬라이드 무대 — 평소엔 페이지 높이를 따라가고, 전체화면에선 화면 전체를 채워 가운데 정렬. */}
      <div
        ref={stageRef}
        className={cn(
          'relative bg-zinc-950',
          isFullscreen && 'flex min-h-0 flex-1 items-center justify-center',
        )}
        style={!isFullscreen && renderW > 0 ? { minHeight: renderW * aspect } : undefined}
      >
        {error ? (
          <div className="px-4 py-16 text-center text-sm text-zinc-400">
            미리보기를 불러오지 못했습니다.{' '}
            <a href={href} target="_blank" rel="noreferrer" className="underline">
              새 탭에서 열기
            </a>
          </div>
        ) : (
          <Document
            file={href}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            onLoadError={() => setError(true)}
            onSourceError={() => setError(true)}
            loading={<div className="py-16 text-center text-sm text-zinc-400">불러오는 중…</div>}
          >
            {renderW > 0 && (
              <Page
                key={shownPage}
                pageNumber={shownPage}
                width={renderW}
                className="mx-auto block"
                renderAnnotationLayer={false}
                renderTextLayer={false}
                onLoadSuccess={(p) => {
                  const w = p.originalWidth || p.width;
                  const h = p.originalHeight || p.height;
                  if (w && h) setAspect(h / w);
                }}
                loading={
                  <div
                    className="animate-pulse bg-zinc-800"
                    style={{ width: renderW, height: renderW * aspect }}
                  />
                }
              />
            )}
          </Document>
        )}

        {/* 인터랙티브: 무대를 반으로 갈라 왼쪽=이전 / 오른쪽=다음. 진입 직후엔 큰 ‹ › 힌트,
            잠시 뒤(또는 첫 넘김 후) 가장자리의 작은 표시로 줄어든다. */}
        {!error && interactive && numPages > 1 && (
          <>
            <HalfNav dir="prev" disabled={!canPrev} big={hintBig} hidden={chromeHidden} onGo={() => go(-1)} />
            <HalfNav dir="next" disabled={!canNext} big={hintBig} hidden={chromeHidden} onGo={() => go(1)} />
          </>
        )}
        {!error && !interactive && (
          <button
            type="button"
            onClick={openInteractive}
            aria-label={`${title} 슬라이드 보기`}
            className="group absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/25"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/90 shadow-lg backdrop-blur-sm transition group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7 fill-white" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* 하단 크롬(프로그레스 바 + 페이지 + 전체화면) — 인터랙티브에서만.
          전체화면에선 오버레이로 겹치고, 숨김 상태에선 아래의 얇은 진행 바가 대신한다. */}
      {interactive && (
        <div
          className={cn(
            'flex items-center gap-3 border-t border-zinc-200 px-3.5 py-2.5 dark:border-zinc-800',
            isFullscreen &&
              'absolute inset-x-0 bottom-0 z-10 border-zinc-800 bg-zinc-950/80 backdrop-blur-md transition-all duration-300',
            chromeHidden && 'pointer-events-none translate-y-2 opacity-0',
          )}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={!canPrev}
            aria-label="이전 슬라이드"
            className="text-lg leading-none text-zinc-500 outline-none transition enabled:hover:text-zinc-800 disabled:opacity-30 dark:enabled:hover:text-zinc-100"
          >
            ‹
          </button>
          <div
            role="progressbar"
            aria-valuenow={page}
            aria-valuemin={1}
            aria-valuemax={numPages || 1}
            onClick={seek}
            className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-zinc-300 dark:bg-zinc-700"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 transition-[width] duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={!canNext}
            aria-label="다음 슬라이드"
            className="text-lg leading-none text-zinc-500 outline-none transition enabled:hover:text-zinc-800 disabled:opacity-30 dark:enabled:hover:text-zinc-100"
          >
            ›
          </button>
          <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {numPages ? `${page} / ${numPages}` : '…'}
          </span>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? '전체화면 나가기' : '전체화면'}
            className="shrink-0 text-zinc-500 outline-none transition hover:text-zinc-800 dark:hover:text-zinc-100"
          >
            <FullscreenIcon on={isFullscreen} />
          </button>
        </div>
      )}

      {/* 전체화면 크롬 숨김 상태 — 바닥에 얇은 진행 바만 깔아 위치를 인식시킨다 */}
      {isFullscreen && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.75 bg-white/10 transition-opacity duration-300',
            chromeHidden ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div
            className="h-full bg-linear-to-r from-indigo-500 to-pink-500 transition-[width] duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 무대 절반을 차지하는 이전/다음 클릭 영역. big=true(진입 직후)엔 큰 ‹ › 튜토리얼 힌트가
 * 떠 있다가 이후 완전히 사라지고, 해당 절반에 마우스를 올리면 같은 크기로 다시 나타난다.
 * hidden=true(전체화면 크롬 숨김)면 호버해도 나타나지 않는다(클릭 넘김은 그대로 동작).
 * 배경 없는 순수 글리프 — 밝은 슬라이드 위에서도 보이도록 그림자만 얹는다.
 */
function HalfNav({
  dir,
  disabled,
  big,
  hidden,
  onGo,
}: {
  dir: 'prev' | 'next';
  disabled: boolean;
  big: boolean;
  hidden: boolean;
  onGo: () => void;
}) {
  const prev = dir === 'prev';
  return (
    <button
      type="button"
      onClick={onGo}
      disabled={disabled}
      aria-label={prev ? '이전 슬라이드' : '다음 슬라이드'}
      className={cn(
        'group absolute inset-y-0 z-1 flex w-1/2 items-center outline-none disabled:cursor-default',
        hidden ? 'cursor-none' : 'cursor-pointer', // 크롬 숨김 땐 클릭 영역 위에서도 포인터 숨김
        prev ? 'left-0 justify-start pl-6' : 'right-0 justify-end pr-6',
      )}
    >
      {!disabled && !hidden && (
        <span
          className={cn(
            'leading-none text-white/90 transition-opacity duration-300 [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]',
            'text-7xl',
            big ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          {prev ? '‹' : '›'}
        </span>
      )}
    </button>
  );
}

/** 전체화면 진입/나가기 아이콘(모서리 확장/축소). */
function FullscreenIcon({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {on ? (
        <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M8 21v-3a2 2 0 0 0-2-2H3M16 21v-3a2 2 0 0 1 2-2h3" />
      ) : (
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
      )}
    </svg>
  );
}
