import { Section } from '@/components/layout/Section';
import { DocGrid } from './DocGrid';
import type { Project } from '@/types/content';

interface ProjectsSectionProps {
  projects: Project[];
  /** 팝업 열림 여부 — 홈이 섹션 rail을 접을지 판단한다(팝업이 자기 목차 rail을 띄우므로). */
  onModalOpenChange?: (open: boolean) => void;
}

/**
 * Projects — 프레임 안 2열 격자.
 * 칸·팝업·상세 골격은 오픈소스 기여와 공유한다(DocGrid). 여기서는 섹션 껍데기만 씌운다.
 */
export function ProjectsSection({ projects, onModalOpenChange }: ProjectsSectionProps) {
  return (
    <Section id="projects" index="03" slug="projects" title="Projects" glow="rose" glowSide="left">
      <DocGrid docs={projects} basePath="/projects" onModalOpenChange={onModalOpenChange} />
    </Section>
  );
}
