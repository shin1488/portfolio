import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Markdown } from '@/components/ui/Markdown';
import { formatPeriod } from './period';
import type { Project } from '@/types/content';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

/**
 * 프로젝트 본문 팝업 — 카드를 누르면 상세 문서의 본문만 이 안에서 읽는다.
 * 목차·읽기 진행 바·스크롤 복원 같은 긴 문서용 장치는 붙이지 않고, '확대'를 눌러
 * 상세 페이지로 넘어갔을 때 제공한다.
 *
 * 라우트 단위 code-split 대상이라 default export를 쓴다 — react-markdown 체인이
 * 홈 번들에 딸려 들어가지 않도록 팝업을 열 때 처음 내려받는다.
 */
export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `project-modal-${project.id}`;

  // 열려 있는 동안 배경 스크롤 잠금 + ESC로 닫기. 잠금은 body가 아닌 html(overflowY)에 건다
  // — html에 overflow-x: clip이 있어, body에 걸면 body가 클리핑 컨테이너가 되며 sticky 헤더가
  // 문서 최상단으로 튀어 버린다(Header의 드로어 잠금과 같은 이유).
  useEffect(() => {
    const prevOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowY = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // 낭독기·키보드 포커스를 팝업 안으로 옮긴다.
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflowY = prevOverflowY;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-[#111113]/85 px-4 py-6 backdrop-blur-sm sm:py-12"
      onClick={(event) => {
        // 패널 바깥(배경)을 눌렀을 때만 닫는다
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-4xl border border-divider bg-[#111113] outline-none"
      >
        {/* 상단 바 — 스크롤해도 제목과 조작 버튼이 남는다 */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-divider bg-[#111113]/95 px-5 py-4 backdrop-blur md:px-8">
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
              className="inline-flex cursor-pointer items-center gap-1.5 border border-divider px-3 py-1.5 font-mono text-[11px] text-zinc-300 transition-colors hover:border-accent/60 hover:text-accent"
            >
              <ExpandIcon />
              확대
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="inline-flex size-8 cursor-pointer items-center justify-center border border-divider text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="px-5 py-8 md:px-8">
          <Markdown>{project.body}</Markdown>
        </div>
      </div>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
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
