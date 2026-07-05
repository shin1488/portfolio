import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Markdown } from '@/components/ui/Markdown';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { content } from '@/data';
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
  useDocumentTitle(`${project.title} — ${content.profile.name}`);
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
      <Link
        to="/#projects"
        state={{ focusProjectIndex: projectIndex }}
        className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <span aria-hidden="true">← </span>프로젝트 목록
      </Link>

      <header className="mt-6">
        <div className="flex items-start justify-between gap-3">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight outline-none">
            {project.title}
          </h1>
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
        <div className="mt-5">
          <ProjectLinks project={project} />
        </div>
      </header>

      <div className="mt-8">
        <TableOfContents entries={toc} />
      </div>

      <div className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <Markdown>{project.body}</Markdown>
      </div>
      </article>
    </>
  );
}
