import { Link } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import { formatPeriod } from './period';
import { HighlightText } from './HighlightText';
import { ProjectKindChip } from './ProjectKindChip';
import { ProjectLinks } from './ProjectLinks';
import type { Project } from '@/types/content';

/** 카드 하나에 노출하는 기술 개수 — 넘치는 만큼은 +N으로 접는다. */
const TECH_VISIBLE = 5;

interface ProjectCardProps {
  project: Project;
  /** 등장 시차(ms) — 같은 행의 카드들을 계단식으로 띄운다. 위치와 무관하게 표시는 동일하다. */
  delay?: number;
  /** 카드를 눌렀을 때 — 넓은 화면이면 본문 팝업을 열고, 좁은 화면이면 상세 페이지로 이동한다 */
  onOpen: () => void;
  /** 마우스를 올리거나 포커스가 닿았을 때 본문 청크를 미리 받아 두는 콜백 */
  onPrefetch?: () => void;
}

/**
 * 프로젝트 카드 — 격자의 한 칸. 여섯 장이 모두 이 컴포넌트 하나로 렌더되고, 좌/우 어느 칸에
 * 놓이든 클래스가 완전히 같다(칸 사이 세로선은 격자 쪽에서 절대 위치 선으로 그린다 —
 * 셀에 border-r을 주면 그 칸의 콘텐츠 폭만 1px 좁아져 썸네일 높이가 옆 칸과 어긋난다).
 *
 * 카드 전체가 오버레이 링크다. 평범한 클릭은 (넓은 화면에서) 본문 팝업을 열고, 새 탭·새 창
 * (⌘·Ctrl·중클릭)과 크롤러에는 상세 페이지 링크 그대로 남는다.
 */
export function ProjectCard({ project, delay = 0, onOpen, onPrefetch }: ProjectCardProps) {
  const shownTech = project.techStack.slice(0, TECH_VISIBLE);
  const hiddenCount = project.techStack.length - shownTech.length;

  return (
    // scroll-mt: 상세에서 목록으로 복귀할 때 sticky 헤더(44px)에 카드 상단이 가리지 않게.
    <article
      id={`project-${project.id}`}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className="group relative scroll-mt-16"
    >
      <Link
        to={`/projects/${project.id}`}
        aria-label={`${project.title} 본문 보기`}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onOpen();
        }}
        className="absolute inset-0 z-1"
      />
      <Reveal delay={delay}>
        <div className="relative aspect-16/10 overflow-hidden border-b border-divider">
          <img
            src={project.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <ProjectKindChip kind={project.kind} className="absolute left-4 top-4" />
        </div>

        <div className="px-5 py-7 md:px-8 md:py-8">
          <div className="flex items-baseline justify-between gap-4">
            {/* 호버 시 로고와 같은 그라데이션이 흐른다 — 단색 그린 대신 액센트 두 색을 모두 쓴다 */}
            <h3 className="bg-linear-to-r from-accent via-accent-end to-accent bg-size-[200%_auto] bg-clip-text text-xl font-bold tracking-tight text-zinc-100 transition-colors group-hover:animate-[logo-flow_2.5s_linear_infinite] group-hover:text-transparent">
              {project.title}
            </h3>
            <span className="shrink-0 text-[11px] text-zinc-500">
              {formatPeriod(project.period)}
            </span>
          </div>

          <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">{project.summary}</p>

          {/* 기술 칩은 상세 페이지와 같은 Badge를 쓴다 — 두 화면의 칩 규격이 어긋나지 않게. */}
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {shownTech.map((tech) => (
              <li key={tech}>
                <Badge>{tech}</Badge>
              </li>
            ))}
            {hiddenCount > 0 && (
              <li className="inline-flex items-center border border-transparent px-2 py-1 text-[11px] text-zinc-600">
                +{hiddenCount}
              </li>
            )}
          </ul>

          <ul className="mt-5 flex flex-col gap-2">
            {project.highlights.map((highlight, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-[1.65] text-zinc-400">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-accent" />
                <span>
                  <HighlightText text={highlight} />
                </span>
              </li>
            ))}
          </ul>

          <div className="relative z-2 mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
              View Details
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                ›
              </span>
            </span>
            <ProjectLinks project={project} />
          </div>
        </div>
      </Reveal>
    </article>
  );
}
