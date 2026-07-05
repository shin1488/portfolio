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

/**
 * 발표자료(PDF) 인라인 뷰어(PDF.js 기반).
 * 처음엔 첫 슬라이드를 미리보기로 보여주고(재생 오버레이), 클릭하면 좌·우 이동·프로그레스 바·
 * 전체화면·키보드(←/→)가 붙는 인터랙티브 모드로 전환된다(같은 Document라 다시 로드하지 않음).
 * 무거우므로 상위(PdfEmbed)에서 뷰가 가까워질 때만 lazy 청크로 로드된다.
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

  // 전체화면 상태 동기화 + 진입 시 재포커스(키보드 유지).
  useEffect(() => {
    const onChange = () => {
      const on = document.fullscreenElement === containerRef.current;
      setIsFullscreen(on);
      if (on) containerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const openInteractive = () => setInteractive(true);

  // 인터랙티브로 전환되면 포커스해 키보드(←/→)가 바로 동작하게 한다(미리보기 땐 포커스 안 뺏음).
  useEffect(() => {
    if (interactive) containerRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const go = (delta: number) =>
    setPage((p) => Math.min(numPages || 1, Math.max(1, p + delta)));

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

  return (
    <div
      ref={containerRef}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={interactive ? onKeyDown : undefined}
      aria-label={`${title} 슬라이드 뷰어`}
      className={cn(
        'not-prose overflow-hidden border border-zinc-200 bg-zinc-100 outline-none dark:border-zinc-800 dark:bg-zinc-900',
        isFullscreen ? 'flex h-screen w-screen flex-col rounded-none border-0' : 'rounded-xl',
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-3.5 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
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

      {/* 슬라이드 무대 — 평소엔 페이지 높이를 따라가고, 전체화면에선 남은 공간을 채워 가운데 정렬. */}
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

        {/* 인터랙티브: 좌·우 이동 버튼 / 미리보기: 재생 오버레이 */}
        {!error && interactive && numPages > 1 && (
          <>
            <NavButton dir="prev" disabled={!canPrev} onClick={() => go(-1)} />
            <NavButton dir="next" disabled={!canNext} onClick={() => go(1)} />
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

      {/* 하단 프로그레스 바 + 페이지 표시 + 전체화면 — 인터랙티브에서만 */}
      {interactive && (
        <div className="flex items-center gap-3 border-t border-zinc-200 px-3.5 py-2.5 dark:border-zinc-800">
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
              style={{ width: `${numPages > 0 ? (page / numPages) * 100 : 0}%` }}
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
    </div>
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

/** 슬라이드 무대 좌·우에 겹치는 큰 이동 버튼. */
function NavButton({
  dir,
  disabled,
  onClick,
}: {
  dir: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? '이전 슬라이드' : '다음 슬라이드'}
      className={`group absolute inset-y-0 ${dir === 'prev' ? 'left-0' : 'right-0'} z-[1] flex w-16 items-center outline-none ${
        dir === 'prev' ? 'justify-start pl-2' : 'justify-end pr-2'
      } disabled:pointer-events-none disabled:opacity-0`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-xl leading-none text-white/70 backdrop-blur-sm transition group-hover:bg-black/60 group-hover:text-white">
        {dir === 'prev' ? '‹' : '›'}
      </span>
    </button>
  );
}
