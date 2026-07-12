import { useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import { formatPeriod } from './period';
import { HighlightText } from './HighlightText';
import { ProjectKindChip } from './ProjectKindChip';
import { ProjectLinks } from './ProjectLinks';
import type { Project } from '@/types/content';

interface ProjectsSectionProps {
  projects: Project[];
}

/** 홈 목록에서 한 카드에 노출하는 기술 개수 — 넘치는 만큼은 +N으로 접는다. */
const TECH_VISIBLE = 5;

/**
 * Projects — 프레임 안 2열 격자. 셀 사이는 hairline만 두고 여백·라운드를 주지 않아
 * 카드가 아니라 도면의 칸처럼 붙는다. 셀 전체가 상세 페이지로 가는 링크이고,
 * 외부 링크(GitHub·Demo 등)는 그 위에 올려 개별 이동을 유지한다.
 */
export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const location = useLocation();
  const n = projects.length;

  // 상세 페이지에서 "목록으로"를 눌러 돌아왔을 때 보고 있던 프로젝트 카드로 복귀시킨다.
  const restoreRaw = (location.state as { focusProjectIndex?: number } | null)?.focusProjectIndex;
  const restoreIdx =
    typeof restoreRaw === 'number' && n > 0 ? Math.min(Math.max(restoreRaw, 0), n - 1) : null;

  // 페인트 전(useLayoutEffect)에 스크롤해 상단이 한 프레임 비치는 것을 막는다.
  // (ScrollManager는 이 state가 있으면 앵커 스크롤을 양보한다)
  useLayoutEffect(() => {
    if (restoreIdx === null) return;
    document
      .getElementById(`project-${projects[restoreIdx].id}`)
      ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    // location.key마다 1회만 — 이후 사용자의 스크롤은 건드리지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  if (!n) return null;

  return (
    <Section id="projects" index="02" slug="projects" title="Projects">
      {/* 첫 행(md는 두 칸)만 위 선을 지운다 — 섹션 헤더의 아래 선과 겹치지 않게. */}
      <div className="grid [&>*:first-child]:border-t-0 [&>*]:border-t [&>*]:border-divider md:grid-cols-2 md:[&>*:nth-child(2)]:border-t-0 md:[&>*:nth-child(odd)]:border-r">
        {projects.map((project, i) => (
          <ProjectCell key={project.id} project={project} delay={(i % 2) * 90} />
        ))}
      </div>
    </Section>
  );
}

function ProjectCell({ project, delay }: { project: Project; delay: number }) {
  const shownTech = project.techStack.slice(0, TECH_VISIBLE);
  const hiddenCount = project.techStack.length - shownTech.length;

  return (
    // scroll-mt: 상세에서 목록으로 복귀할 때 sticky 헤더(44px)에 카드 상단이 가리지 않게.
    <article id={`project-${project.id}`} className="group relative scroll-mt-16">
      {/* 셀 전체를 덮는 상세 이동 링크 — 그 위에 올린 외부 링크만 개별 이동한다 */}
      <Link
        to={`/projects/${project.id}`}
        aria-label={`${project.title} 상세 페이지 보기`}
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
            <h3 className="text-xl font-bold tracking-tight text-zinc-100 transition-colors group-hover:text-accent">
              {project.title}
            </h3>
            <span className="shrink-0 font-mono text-[11px] text-zinc-500">
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
              <li className="inline-flex items-center border border-transparent px-2 py-1 font-mono text-[11px] text-zinc-600">
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
