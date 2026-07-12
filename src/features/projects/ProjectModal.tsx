import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Markdown } from '@/components/ui/Markdown';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { ScrollTopButton } from '@/components/ui/ScrollTopButton';
import { cn } from '@/lib/cn';
import { useRevealOnScroll } from '@/lib/useRevealOnScroll';
import { formatPeriod } from './period';
import type { Project } from '@/types/content';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

/** 여닫이 트랜지션 길이(ms) — 닫을 때 이 시간만큼 기다렸다가 언마운트한다. */
const TRANSITION_MS = 260;

/**
 * 프로젝트 본문 팝업 — 카드를 누르면 상세 문서의 본문만 이 안에서 읽는다.
 * 목차·스크롤 복원 같은 긴 문서용 장치는 붙이지 않고, '확대'를 눌러 상세 페이지로
 * 넘어갔을 때 제공한다.
 *
 * 스크롤 컨테이너는 오버레이가 아니라 패널 안쪽 본문 영역이다 — 오버레이를 스크롤시키면
 * 본문이 상단 바 위로 흘러 올라가 버린다. 상단 바를 고정 높이로 두고 본문만 스크롤시키면
 * 본문이 바를 넘어설 수 없고, 바 아래 진행 바와 '맨 위로' 버튼도 이 컨테이너 기준으로
 * 계산할 수 있다.
 *
 * 라우트 단위 code-split 대상이라 default export를 쓴다 — react-markdown 체인이
 * 홈 번들에 딸려 들어가지 않도록 팝업을 열 때 처음 내려받는다.
 */
export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  // 마운트 다음 프레임에 켜서 등장 트랜지션(페이드 + 살짝 확대)이 발동하게 한다.
  // 닫을 때는 다시 꺼서 퇴장 트랜지션을 보인 뒤 언마운트한다.
  const [shown, setShown] = useState(false);
  const titleId = `project-modal-${project.id}`;

  useRevealOnScroll(bodyRef, '.prose > *', bodyRef);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const requestClose = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, TRANSITION_MS);
  }, [onClose]);

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
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[88vh] w-full max-w-4xl flex-col border border-divider bg-[#111113] outline-none transition-[opacity,transform,scale] ease-[cubic-bezier(0.22,1,0.36,1)]',
          shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-97 opacity-0',
        )}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        {/* 상단 바 — 높이가 고정된 flex 항목이라 본문이 이 위로 올라오지 못한다 */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-divider px-5 py-4 md:px-8">
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
              onClick={() => navigate(`/projects/${project.id}`)}
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

        {/* 읽기 진행 바 — 상단 바 바로 아래(모바일 헤더와 같은 자리). 패널 본문 스크롤을 읽는다. */}
        <ScrollProgressBar scrollRef={bodyRef} className="shrink-0" />

        {/* 본문 — 네이티브 스크롤바는 숨긴다(위 진행 바가 위치를 알려 준다) */}
        <div
          ref={bodyRef}
          onScroll={(event) => {
            // 진행률은 ScrollProgressBar가 DOM을 직접 갱신한다. 여기서는 참/거짓이 뒤집힐 때만
            // 렌더를 일으켜, 스크롤 중 팝업 전체가 매 프레임 다시 렌더되지 않게 한다.
            const next = event.currentTarget.scrollTop > 240;
            setScrolled((prev) => (prev === next ? prev : next));
          }}
          // pb: 맨 위로 버튼(우하단 고정)이 마지막 문단을 덮지 않도록 바닥 여백을 확보한다.
          className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-28 pt-8 md:px-8"
        >
          <Markdown>{project.body}</Markdown>
        </div>

        {/* 맨 위로 — 패널 우하단. 상세 페이지와 같은 공용 버튼이다. */}
        <ScrollTopButton
          visible={scrolled}
          onClick={() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute bottom-6 right-6"
        />
      </div>
    </div>
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
