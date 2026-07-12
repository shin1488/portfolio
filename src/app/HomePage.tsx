import { HatchDivider } from '@/components/layout/Frame';
import { SectionRail } from '@/components/layout/SectionRail';
import { content } from '@/data';
import { CareersSection } from '@/features/careers/CareersSection';
import { IntroductionSection } from '@/features/profile/IntroductionSection';
import { ProfileSection } from '@/features/profile/ProfileSection';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { SkillsSection } from '@/features/skills/SkillsSection';
import { SITE_NAME } from '@/lib/site';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useRouteFocus } from '@/lib/useRouteFocus';

/**
 * 홈 — 히어로부터 마지막 섹션까지 하나의 프레임(좌우 hairline)이 관통하고,
 * 섹션과 섹션은 빗금 구분대로 나뉜다.
 */
export function HomePage() {
  useDocumentTitle(SITE_NAME);
  const headingRef = useRouteFocus();
  return (
    <>
      <ProfileSection profile={content.profile} headingRef={headingRef} />
      <HatchDivider />
      <IntroductionSection bio={content.profile.bio} />
      <HatchDivider />
      <ProjectsSection projects={content.projects} />
      <HatchDivider />
      <SkillsSection categories={content.skillCategories} />
      <HatchDivider />
      <CareersSection categories={content.careers} />
      <SectionRail />
    </>
  );
}
