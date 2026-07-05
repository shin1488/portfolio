import { useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/cn';
import { scrollToSection, scrollToTrackStep } from '@/lib/section';
import { useStickyProgress } from '@/lib/useStickyProgress';
import { formatPeriod } from './period';
import { ProjectKindChip } from './ProjectKindChip';
import { ProjectLinks } from './ProjectLinks';
import type { Project } from '@/types/content';

interface ProjectsSectionProps {
  projects: Project[];
}

/**
 * Projects — 핀 고정 크로스페이드. 프로젝트 1개 = 1화면, 스크롤 진행도에 따라 블록이
 * 겹쳐진 채로 페이드 전환된다. 하단 이전/다음 화살표와 진행 dot으로도 이동.
 * 각 블록 전체가 상세 페이지로 가는 오버레이 링크(외부 링크는 그 위로 올려 개별 유지).
 * 모바일: 핀 없이 세로로 나열.
 */
export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const n = projects.length;

  // 상세 페이지에서 "프로젝트 목록"으로 돌아올 때 복귀시킬 프로젝트 인덱스(없으면 null).
  const restoreRaw = (location.state as { focusProjectIndex?: number } | null)?.focusProjectIndex;
  const restoreIdx =
    typeof restoreRaw === 'number' && n > 0 ? Math.min(Math.max(restoreRaw, 0), n - 1) : null;

  // 첫 렌더부터 복귀 인덱스를 활성화해 0→k 크로스페이드/플래시를 없앤다.
  const activeP = useStickyProgress(trackRef, n, false, restoreIdx ?? 0);

  // 보고 있던 프로젝트가 놓인 트랙 구간으로 복귀 — 페인트 전(useLayoutEffect)에 스크롤해 상단 플래시를 막는다.
  // (ScrollManager는 이 state가 있으면 앵커 스크롤을 양보한다)
  useLayoutEffect(() => {
    if (restoreIdx === null) return;
    const track = trackRef.current;
    const scrollable = track ? track.offsetHeight - window.innerHeight : 0;
    if (scrollable > 0) {
      scrollToTrackStep(track, restoreIdx, n, 'instant'); // 데스크톱 핀 트랙: 해당 프로젝트 구간으로
    } else {
      scrollToSection('projects', 'instant'); // 모바일(핀 없음): 섹션 상단으로
    }
    // location.key마다 1회만 — 이후 사용자의 스크롤은 건드리지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  if (!n) return null;

  return (
    <section id="projects" aria-label="Projects" className="scroll-mt-14">
      {/* 데스크톱: 핀 고정 크로스페이드 */}
      <div ref={trackRef} className="relative hidden sm:block" style={{ height: `${100 + n * 58}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto w-full max-w-5xl px-6">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
              <div className="mt-4 flex justify-center gap-2">
                {projects.map((project, i) => (
                  <button
                    key={project.id}
                    type="button"
                    aria-label={`${project.title}로 이동`}
                    aria-current={i === activeP}
                    onClick={() => scrollToTrackStep(trackRef.current, i, n)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-[250ms]',
                      i === activeP ? 'w-[26px] bg-indigo-400' : 'w-1.5 bg-zinc-700',
                    )}
                  />
                ))}
              </div>
            </div>

            {/* 크로스페이드 스택 — 블록들을 같은 그리드 셀에 겹친다 */}
            <div className="mt-12 grid">
              {projects.map((project, i) => (
                <ProjectBlock key={project.id} project={project} active={i === activeP} />
              ))}
            </div>

            {/* 이전 / 다음 */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <ArrowButton
                dir="prev"
                disabled={activeP === 0}
                onClick={() => scrollToTrackStep(trackRef.current, activeP - 1, n)}
              />
              <span className="min-w-[54px] text-center text-[13px] tabular-nums text-zinc-400">
                {String(activeP + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
              <ArrowButton
                dir="next"
                disabled={activeP === n - 1}
                onClick={() => scrollToTrackStep(trackRef.current, activeP + 1, n)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일: 핀 없이 세로 나열 */}
      <div className="mx-auto max-w-2xl px-6 py-14 sm:hidden">
        <h2 className="text-center text-2xl font-bold tracking-tight">Projects</h2>
        <div className="mt-8 flex flex-col gap-12">
          {projects.map((project) => (
            <ProjectBlock key={project.id} project={project} active mobile />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectBlock({
  project,
  active,
  mobile = false,
}: {
  project: Project;
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative',
        // 모든 블록이 셀 최대 높이로 stretch되고, flex items-center로 안쪽 그리드를 그 중앙에 둔다
        // → 안쪽 그리드 중앙 = 블록(=셀) 중앙(상수)이라, 콘텐츠 길이와 무관하게 썸네일 위치가 고정된다.
        !mobile && 'col-start-1 row-start-1 flex items-center transition-opacity duration-500 ease-out',
        !mobile && (active ? 'opacity-100' : 'pointer-events-none opacity-0'),
      )}
      aria-hidden={!mobile && !active}
    >
      {/* 블록 전체를 덮는 상세 이동 링크 */}
      <Link
        to={`/projects/${project.id}`}
        aria-label={`${project.title} 상세 페이지 보기`}
        className="absolute inset-0 z-[1]"
        tabIndex={active ? 0 : -1}
      />

      <div className="w-full grid gap-14 sm:[grid-template-columns:1.05fr_0.95fr] sm:items-center">
        {/* 좌: 정보 */}
        <div>
          <ProjectKindChip kind={project.kind} />
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-zinc-100">{project.title}</h3>
          <p className="mt-1.5 text-[13px] tabular-nums text-zinc-500">
            {formatPeriod(project.period)}
          </p>
          <p className="mt-4 text-base leading-[1.7] text-zinc-300">{project.summary}</p>

          <ul className="mt-5 flex flex-col gap-2.5">
            {project.highlights.map((highlight, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-[1.6] text-zinc-400">
                <span aria-hidden="true" className="mt-[7px] size-[5px] shrink-0 bg-indigo-400" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-[1.7] text-zinc-500">{project.techStack.join(' · ')}</p>

          <div className="relative z-[2] mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 transition-colors group-hover:text-indigo-200">
              상세 페이지 보기
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
            <ProjectLinks project={project} />
          </div>
        </div>

        {/* 우: 썸네일 */}
        <div>
          <img
            src={project.thumbnail}
            alt={`${project.title} 미리보기`}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-2xl border border-zinc-800 object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function ArrowButton({
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
      aria-label={dir === 'prev' ? '이전 프로젝트' : '다음 프로젝트'}
      className={cn(
        'flex size-8 items-center justify-center rounded-full border border-zinc-800 text-base text-zinc-300 transition-colors',
        disabled ? 'cursor-default opacity-30' : 'hover:border-zinc-600 hover:text-zinc-100',
      )}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  );
}
