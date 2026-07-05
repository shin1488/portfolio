import { SectionRail } from '@/components/layout/SectionRail';
import { content } from '@/data';
import { CareersSection } from '@/features/careers/CareersSection';
import { IntroductionSection } from '@/features/profile/IntroductionSection';
import { ProfileSection } from '@/features/profile/ProfileSection';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { SkillsSection } from '@/features/skills/SkillsSection';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useRouteFocus } from '@/lib/useRouteFocus';
import { useSectionPager } from '@/lib/useSectionPager';

// 각 섹션의 DOM id 순서 — 섹션 사이 전환 구간에서 인접 섹션으로 강제 스냅할 대상.
const SECTION_IDS = ['profile', 'about', 'skills', 'projects', 'careers'];

export function HomePage() {
  useDocumentTitle(`${content.profile.name} — ${content.profile.role}`);
  const headingRef = useRouteFocus();
  useSectionPager(SECTION_IDS);
  return (
    <>
      <ProfileSection profile={content.profile} headingRef={headingRef} />
      <IntroductionSection bio={content.profile.bio} />
      <SkillsSection categories={content.skillCategories} />
      <ProjectsSection projects={content.projects} />
      <CareersSection categories={content.careers} />
      <SectionRail />
    </>
  );
}
