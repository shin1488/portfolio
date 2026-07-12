import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';

interface IntroductionSectionProps {
  bio: string[];
}

/**
 * Introduction — 자기소개 문단을 번호가 붙은 격자 행으로 쌓는다.
 * 좌측 모노 번호가 도면의 항목 번호처럼 읽히고, 우측이 본문이다.
 */
export function IntroductionSection({ bio }: IntroductionSectionProps) {
  if (!bio.length) return null;

  return (
    <Section id="about" index="01" slug="about" title="Introduction">
      {/* 행 사이에만 hairline — 첫 행 위는 섹션 헤더의 아래 선이, 마지막 행 아래는
          다음 구분대의 위 선이 이미 그어져 있어 중복을 피한다. */}
      <ul className="[&>*:first-child]:border-t-0 [&>*]:border-t [&>*]:border-divider">
        {bio.map((paragraph, i) => (
          <li key={i}>
            <Reveal delay={i * 80}>
              <div className="grid gap-3 px-5 py-8 md:grid-cols-[5rem_minmax(0,1fr)] md:gap-6 md:px-8 md:py-10">
                <span
                  aria-hidden="true"
                  className="text-[11px] leading-8 text-zinc-600"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] leading-[1.9] text-zinc-300 md:text-[17px]">
                  {paragraph}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
