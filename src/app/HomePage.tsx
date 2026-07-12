import { useState } from 'react';
import { HatchDivider } from '@/components/layout/Frame';
import { SectionRail } from '@/components/layout/SectionRail';
import { content } from '@/data';
import { CareersSection } from '@/features/careers/CareersSection';
import { IntroductionSection } from '@/features/profile/IntroductionSection';
import { ProfileSection } from '@/features/profile/ProfileSection';
import { OscSection } from '@/features/docs/OscSection';
import { ProjectsSection } from '@/features/docs/ProjectsSection';
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
  // 본문 팝업이 열리면 섹션 rail을 접는다 — 팝업이 그 자리에 자기 목차 rail을 띄우므로,
  // 그대로 두면 우측에 rail이 두 개 겹친다.
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <ProfileSection profile={content.profile} headingRef={headingRef} />
      <HatchDivider />
      <IntroductionSection bio={content.profile.bio} />
      <HatchDivider />
      <OscSection contributions={content.contributions} onModalOpenChange={setModalOpen} />
      <HatchDivider />
      <ProjectsSection projects={content.projects} onModalOpenChange={setModalOpen} />
      <HatchDivider />
      <SkillsSection categories={content.skillCategories} />
      <HatchDivider />
      <CareersSection categories={content.careers} />
      {!modalOpen && <SectionRail />}
    </>
  );
}
