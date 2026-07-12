import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { FlickerSpinner } from '@/components/ui/FlickerSpinner';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { ScrollTopButton } from '@/components/ui/ScrollTopButton';
import { SideRail } from '@/components/ui/SideRail';
import { cn } from '@/lib/cn';
import { scrollToHeading } from '@/lib/section';
import type { TocEntry } from '@/lib/toc';
import { useActiveHeadingId } from '@/lib/useScroll';
import { DOC_TRANSITION } from '@/lib/viewTransition';
import { formatPeriod } from './period';
import type { Project } from '@/types/content';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

/** 여닫이 트랜지션 길이(ms) — 닫을 때 이 시간만큼 기다렸다가 언마운트한다. */
const TRANSITION_MS = 260;

/**
 * 무거운 것만 lazy로 뗀다 — 팝업 껍데기는 홈 번들에 있어 클릭 즉시 뜨고, react-markdown 체인
 * (300KB대)과 상세 라우트는 필요할 때 내려받는다. 카드 호버 시 미리 받아 두기도 한다(preload).
 */
const ProjectBody = lazy(() => import('./ProjectBody'));
export const preloadProjectBody = () => import('./ProjectBody');
const preloadProjectDetail = () => import('./ProjectDetailPage');

/**
 * 프로젝트 본문 팝업 — 카드를 누르면 상세 문서의 본문만 이 안에서 읽는다.
 * 우측 목차 rail은 상세 페이지와 같은 SideRail이고, 스크롤 복원 같은 나머지 장치는
 * '확대'로 상세 페이지에 넘어갔을 때 제공한다.
 *
 * 스크롤 컨테이너는 오버레이가 아니라 패널 안쪽 본문 영역이다 — 오버레이를 스크롤시키면
 * 본문이 상단 바 위로 흘러 올라가 버린다. 상단 바를 고정 높이로 두고 본문만 스크롤시키면
 * 본문이 바를 넘어설 수 없고, 진행 바·맨 위로 버튼·목차 rail도 이 컨테이너 기준으로 계산한다.
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  // 마운트 다음 프레임에 켜서 등장 트랜지션(페이드 + 살짝 확대)이 발동하게 한다.
  // 닫을 때는 다시 꺼서 퇴장 트랜지션을 보인 뒤 언마운트한다.
  const [shown, setShown] = useState(false);
  const titleId = `project-modal-${project.id}`;

  // 목차는 본문 청크(ProjectBody)가 렌더되면서 올려 준다 — 여기서 뽑으면 슬러거가 홈 번들에 붙는다.
  const [toc, setToc] = useState<TocEntry[]>([]);
  const { activeId, select } = useActiveHeadingId(
    toc.map((entry) => entry.id),
    bodyRef,
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const requestClose = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, TRANSITION_MS);
  }, [onClose]);

  /**
   * '확대' — 팝업 패널이 상세 본문으로 늘어나며 라우트가 바뀐다.
   *
   * react-router의 navigate({ viewTransition: true })는 Data/Framework 모드 전용이라
   * 우리 <BrowserRouter>(선언형 모드)에선 무시된다. 그래서 직접 startViewTransition으로 감싼다.
   * 콜백 안에서 flushSync로 라우트를 동기 렌더시키되, 상세 라우트는 lazy라 그 순간엔 아직
   * Suspense 폴백이다 — 콜백이 돌려준 프로미스를 두 프레임 뒤에 풀어, 실제 본문이 DOM에 붙은
   * 뒤에 '새 화면' 스냅샷이 찍히게 한다(그래야 팝업 → 본문 모프가 성립한다).
   * 미지원 브라우저와 동작 줄이기 설정에서는 애니메이션 없이 즉시 이동한다.
   */
  const expandToDetail = useCallback(async () => {
    const path = `/projects/${project.id}`;
    const start = document.startViewTransition?.bind(document);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 청크를 먼저 받아 둔다 — 전환 도중에 내려받으면 스냅샷이 로딩 화면을 잡는다.
    await preloadProjectDetail();
    if (!start || reduce) {
      navigate(path);
      return;
    }
    start(
      () =>
        new Promise<void>((resolve) => {
          flushSync(() => navigate(path));
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
  }, [navigate, project.id]);

  // 열려 있는 동안 배경 스크롤 잠금 + ESC로 닫기. 잠금은 body가 아닌 html(overflowY)에 건다
  // — html에 overflow-x: clip이 있어, body에 걸면 body가 클리핑 컨테이너가 되며 sticky 헤더가
  // 문서 최상단으로 튀어 버린다(Header의 드로어 잠금과 같은 이유).
  useEffect(() => {
    const prevOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowY = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflowY = prevOverflowY;
      window.removeEventListener('keydown', onKey);
    };
  }, [requestClose]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-[#111113]/85 p-4 backdrop-blur-sm transition-opacity',
          shown ? 'opacity-100' : 'opacity-0',
        )}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        onClick={(event) => {
          // 패널 바깥(배경)을 눌렀을 때만 닫는다
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        {/* 폭은 상세 본문(max-w-3xl)과 동일 — 같은 글을 같은 줄 길이로 읽게 한다 */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cn(
            'relative flex max-h-[88vh] w-full max-w-3xl flex-col border border-divider bg-[#111113] outline-none transition-[opacity,transform,scale] ease-[cubic-bezier(0.22,1,0.36,1)]',
            shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-97 opacity-0',
          )}
          // viewTransitionName: '확대'로 상세 페이지에 넘어갈 때 이 패널이 상세 본문 박스로
          // 늘어나는 모프의 짝이 된다(상세 페이지의 article이 같은 이름을 쓴다).
          style={{ transitionDuration: `${TRANSITION_MS}ms`, viewTransitionName: DOC_TRANSITION }}
        >
          {/* 상단 바 — 높이가 고정된 flex 항목이라 본문이 이 위로 올라오지 못한다 */}
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-divider px-6 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-lg font-bold tracking-tight text-zinc-100">
                {project.title}
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                {formatPeriod(project.period)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={expandToDetail}
                aria-label="상세 페이지에서 보기"
                className="inline-flex size-8 cursor-pointer items-center justify-center border border-divider text-zinc-400 transition-colors hover:border-accent/60 hover:text-accent"
              >
                <ExpandIcon />
              </button>
              <button
                type="button"
                onClick={requestClose}
                aria-label="닫기"
                className="inline-flex size-8 cursor-pointer items-center justify-center border border-divider text-zinc-400 transition-colors hover:text-zinc-100"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* 읽기 진행 바 — 상단 바와 본문 사이. 트랙을 불투명하게 두고 두께를 키웠다:
              흰 배경 이미지가 바로 아래로 지나가면 얇고 반투명한 바는 눈에서 사라진다. */}
          <ScrollProgressBar scrollRef={bodyRef} className="h-1 shrink-0 bg-zinc-800" />

          {/* 본문 — 네이티브 스크롤바는 숨긴다(위 진행 바와 우측 rail이 위치를 알려 준다).
              pb: 맨 위로 버튼(우하단 고정)이 마지막 문단을 덮지 않도록 바닥 여백을 확보한다. */}
          <div
            ref={bodyRef}
            onScroll={(event) => {
              // 진행률은 ScrollProgressBar가 DOM을 직접 갱신한다. 여기서는 참/거짓이 뒤집힐 때만
              // 렌더를 일으켜, 스크롤 중 팝업 전체가 매 프레임 다시 렌더되지 않게 한다.
              const next = event.currentTarget.scrollTop > 240;
              setScrolled((prev) => (prev === next ? prev : next));
            }}
            className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 pb-28 pt-8"
          >
            <Suspense
              fallback={
                <div className="flex justify-center py-24 text-zinc-600">
                  <FlickerSpinner className="size-11" />
                </div>
              }
            >
              <ProjectBody body={project.body} scrollRootRef={bodyRef} onToc={setToc} />
            </Suspense>
          </div>

          {/* 맨 위로 — 패널 우하단. 상세 페이지와 같은 공용 버튼이다. */}
          <ScrollTopButton
            visible={scrolled}
            onClick={() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute bottom-6 right-6"
          />
        </div>
      </div>

      {/* 목차 rail — 패널 바깥(화면 우측)에 뜬다. 상세 페이지와 같은 컴포넌트·같은 위치 규칙이라
          화면이 좁아지면 똑같이 접히고 사라진다. */}
      {toc.length >= 2 && shown && (
        <SideRail
          ariaLabel="섹션 바로가기"
          items={toc.map((entry) => ({ id: entry.id, label: entry.text }))}
          activeId={activeId}
          onSelect={(id) => {
            select(id);
            scrollToHeading(id);
          }}
          expandedOffsetRem={28}
          className="z-50"
        />
      )}
    </>
  );
}

function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
