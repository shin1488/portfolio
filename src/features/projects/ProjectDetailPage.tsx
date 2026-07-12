import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Markdown } from '@/components/ui/Markdown';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { content } from '@/data';
import { SITE_NAME } from '@/lib/site';
import { extractToc } from '@/lib/toc';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useRevealOnScroll } from '@/lib/useRevealOnScroll';
import { useRouteFocus } from '@/lib/useRouteFocus';
import { formatPeriod } from './period';
import { HighlightText } from './HighlightText';
import { ProjectKindChip } from './ProjectKindChip';
import { ProjectLinks } from './ProjectLinks';
import { DOC_TRANSITION_ATTR } from '@/lib/viewTransition';
import { ReadingAids } from './ReadingAids';
import { TableOfContents } from './TableOfContents';
import type { Project } from '@/types/content';

/** 라우트 단위 code-split 대상이라 default export를 사용한다. */
export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = content.projects.find((p) => p.id === projectId);

  if (!project) {
    return <NotFoundView />;
  }
  return <ProjectDetailView project={project} />;
}

function ProjectDetailView({ project }: { project: Project }) {
  useDocumentTitle(`${SITE_NAME} - ${project.title}`);
  const headingRef = useRouteFocus();
  // 목차는 마크다운 본문에서 매번 파생 — 본문이 바뀌면 목차·미니목차·진행바가 자동 갱신된다.
  const toc = useMemo(() => extractToc(project.body), [project.body]);
  // 목록으로 돌아갈 때 이 프로젝트가 놓인 핀 트랙 구간으로 복귀시키기 위한 인덱스.
  // (state는 Link가 SPA 이동에 실어 보내고, ProjectsSection이 마운트 시 해당 구간으로 스크롤한다)
  const projectIndex = content.projects.findIndex((p) => p.id === project.id);
  // 본문 블록을 스크롤 진입 시 하나씩 떠오르게 한다(홈의 Reveal과 같은 효과).
  const bodyRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(bodyRef, '.prose > *');
  return (
    <>
      <ReadingAids entries={toc} />


      {/* 읽기 화면이라 폭은 프레임(72rem)까지 넓히지 않는다 — 한 줄이 길어지면 눈이 줄을 되짚기
          어렵다. 좌우 세로선도 두지 않는다(진행 바와 목차 rail이 이미 양옆을 잡고 있다).
          data 표식: 팝업의 전환 콜백이 '상세 본문이 DOM에 붙었는지'를 이걸로 판단한다. */}
      <article {...{ [DOC_TRANSITION_ATTR]: '' }} className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      {/* 뒤로가기 줄 — 모바일에선 이 줄 맨 우측에 코드 바로가기를 둔다(제목 줄이 빽빽해지지 않게) */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/#projects"
          state={{ focusProjectIndex: projectIndex }}
          className="group inline-flex items-center text-sm font-medium"
        >
          {/* 화살표는 클립 밖 솔리드 색 — transform 이동 시 사라지지 않게. 텍스트만 breathing. */}
          <span
            aria-hidden="true"
            className="mr-1 text-accent transition-transform group-hover:-translate-x-1"
          >
            ←
          </span>
          <span className="bg-linear-to-r from-accent to-accent-end bg-clip-text text-accent transition-colors group-hover:text-transparent">
            프로젝트 목록
          </span>
        </Link>
        {/* 모바일(<sm)만: 코드 바로가기(GitLab 등)를 뒤로가기 줄 우측에 */}
        <div className="sm:hidden">
          <ProjectLinks project={project} />
        </div>
      </div>

      <header className="mt-6">
        <div className="flex items-start justify-between gap-3">
          {/* 제목 + 코드 바로가기 — 데스크톱(sm+)만 제목 옆 베이스라인 정렬(모바일은 위 뒤로가기 줄에 있음) */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold tracking-tight outline-none">
              {project.title}
            </h1>
            <div className="hidden sm:block">
              <ProjectLinks project={project} />
            </div>
          </div>
          <ProjectKindChip kind={project.kind} className="mt-1.5 shrink-0" />
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {formatPeriod(project.period)}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
        {/* 핵심 요약(highlights) — 홈 카드를 거치지 않고 직링크로 온 독자를 위한 프로젝트 급 요약 */}
        {project.highlights.length > 0 && (
          <ul className="mt-5 flex flex-col gap-2">
            {project.highlights.map((highlight, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-[1.65] text-zinc-600 dark:text-zinc-400">
                <span aria-hidden="true" className="mt-1.75 size-1.25 shrink-0 bg-accent" />
                <span>
                  <HighlightText text={highlight} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="mt-5">
        <TableOfContents entries={toc} />
      </div>

      <div ref={bodyRef} className="mt-5 border-t border-divider pt-5">
        <Markdown>{project.body}</Markdown>
      </div>
      </article>
    </>
  );
}
