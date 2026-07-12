import type { Project } from '@/types/content';

/** 프로젝트 외부 링크(GitHub, Demo 등) 목록 — 카드와 상세 페이지에서 공용 */
export function ProjectLinks({ project }: { project: Project }) {
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
          className="bg-linear-to-r from-accent to-accent-end bg-clip-text font-mono text-[11px] text-zinc-500 transition-colors hover:text-transparent"
        >
          {link.label} <span aria-hidden="true">↗</span>
          <span className="sr-only"> — {project.title} (새 탭에서 열림)</span>
        </a>
      ))}
    </div>
  );
}
