import type { Project } from '@/types/content';

interface ProjectLinksProps {
  project: Project;
}

/** 프로젝트 외부 링크(GitHub, Demo 등) 목록 — 카드와 상세 페이지에서 공용 */
export function ProjectLinks({ project }: ProjectLinksProps) {
  if (project.links.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-4">
      {project.links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-indigo-600 hover:bg-linear-to-r hover:from-indigo-400 hover:to-pink-400 hover:bg-clip-text hover:text-transparent dark:text-indigo-400"
        >
          {link.label} <span aria-hidden="true">↗</span>
          <span className="sr-only"> — {project.title} (새 탭에서 열림)</span>
        </a>
      ))}
    </div>
  );
}
