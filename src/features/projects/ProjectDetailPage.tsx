import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Markdown } from '@/components/ui/Markdown';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { content } from '@/data';
import { SITE_NAME } from '@/lib/site';
import { extractToc } from '@/lib/toc';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useRouteFocus } from '@/lib/useRouteFocus';
import { formatPeriod } from './period';
import { ProjectKindChip } from './ProjectKindChip';
import { ProjectLinks } from './ProjectLinks';
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
  return (
    <>
      <ReadingAids entries={toc} />
      <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
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
            className="mr-1 text-indigo-600 transition-transform group-hover:-translate-x-1 dark:text-indigo-400"
          >
            ←
          </span>
          <span className="bg-linear-to-r from-indigo-400 via-pink-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-indigo-600 transition-colors group-hover:animate-[logo-flow_2s_linear_infinite] group-hover:text-transparent dark:text-indigo-400">
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
            <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight outline-none">
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
      </header>

      <div className="mt-5">
        <TableOfContents entries={toc} />
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <Markdown>{project.body}</Markdown>
      </div>
      </article>
    </>
  );
}
