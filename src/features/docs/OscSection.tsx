import { Section } from '@/components/layout/Section';
import { DocGrid } from './DocGrid';
import type { Contribution } from '@/types/content';

interface OscSectionProps {
  contributions: Contribution[];
  /** 팝업 열림 여부 — 홈이 섹션 rail을 접을지 판단한다(팝업이 자기 목차 rail을 띄우므로). */
  onModalOpenChange?: (open: boolean) => void;
}

/**
 * Open Source Contributions — 프로젝트와 같은 2열 격자이되 썸네일이 없다.
 * 이슈·PR에는 보여 줄 화면이 없어, 카드가 제목·요약·핵심 세 줄로 곧장 읽히게 둔다.
 */
export function OscSection({ contributions, onModalOpenChange }: OscSectionProps) {
  return (
    <Section
      id="osc"
      index="02"
      slug="open-source"
      title="Open Source Contributions"
      glow="green"
      glowSide="right"
    >
      <DocGrid docs={contributions} basePath="/osc" onModalOpenChange={onModalOpenChange} />
    </Section>
  );
}
