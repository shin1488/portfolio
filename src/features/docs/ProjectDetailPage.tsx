import { useParams } from 'react-router';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { content } from '@/data';
import { DocDetailView } from './DocDetailView';
import { ProjectKindChip } from './ProjectKindChip';

/** 라우트 단위 code-split 대상이라 default export를 사용한다. */
export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const index = content.projects.findIndex((project) => project.id === projectId);
  const project = content.projects[index];

  if (!project) {
    return <NotFoundView />;
  }
  return (
    <DocDetailView
      doc={project}
      listHash="#projects"
      basePath="/projects"
      backLabel="프로젝트 목록"
      docIndex={index}
      titleAside={<ProjectKindChip kind={project.kind} className="mt-1.5 shrink-0" />}
    />
  );
}
