import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';
import type { Skill, SkillCategory } from '@/types/content';

interface SkillsSectionProps {
  categories: SkillCategory[];
}

/**
 * Skills — 상단에 전체 기술이 흐르는 마퀴 두 줄, 아래에 카테고리별 격자.
 * 마퀴는 훑어보는 용도라 순서를 섞어 두 줄로 나누고, 정확한 분류는 아래 격자가 담당한다.
 */
export function SkillsSection({ categories }: SkillsSectionProps) {
  if (!categories.length) return null;

  const all = categories.flatMap((category) => category.skills);
  const rowA = all.filter((_, i) => i % 2 === 0);
  const rowB = all.filter((_, i) => i % 2 === 1);

  return (
    <Section id="skills" index="03" slug="skills" title="Skills" glow="blue" glowSide="right">
      <div className="marquee relative overflow-hidden border-b border-divider py-7">
        <MarqueeRow skills={rowA} seconds={44} />
        <MarqueeRow skills={rowB} seconds={52} reverse />
        {/* 양끝 페이드 — 프레임 세로선 안쪽에서 흐름이 자연스럽게 사라지게 한다 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-[#111113] to-transparent md:w-28"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-[#111113] to-transparent md:w-28"
        />
      </div>

      {/* 세로 divider는 절대 위치 선 — 셀에 border-r을 주면 그 칸의 콘텐츠 폭만 1px 좁아진다 */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-divider md:block"
        />
        <div className="grid [&>*:first-child]:border-t-0 [&>*]:border-t [&>*]:border-divider md:grid-cols-2 md:[&>*:nth-child(2)]:border-t-0">
          {categories.map((category, i) => (
            <div key={category.id} className="px-5 py-7 md:px-8">
            <Reveal delay={(i % 2) * 90}>
              <p className="font-mono text-[11px] text-zinc-500">{category.title}/</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                {category.skills.map((skill) => (
                  <li key={skill.name}>
                    <span
                      className={cn(
                        'text-[15px]',
                        skill.highlight
                          ? 'font-semibold text-accent'
                          : 'font-medium text-zinc-300',
                      )}
                    >
                      {skill.name}
                      {skill.highlight && <span className="sr-only"> (주력)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/**
 * 마퀴 한 줄 — 같은 목록을 두 벌 이어 붙이고 -50%까지 이동시켜 이음매 없이 순환시킨다.
 * 두 번째 벌은 시각적 중복이므로 낭독기에서 숨긴다.
 */
function MarqueeRow({
  skills,
  seconds,
  reverse = false,
}: {
  skills: Skill[];
  seconds: number;
  reverse?: boolean;
}) {
  return (
    <div className="flex overflow-hidden py-1.5">
      <ul
        className={cn('marquee-track flex shrink-0 items-center', reverse && 'is-reverse')}
        style={{ ['--marquee-duration' as string]: `${seconds}s` }}
      >
        {[...skills, ...skills].map((skill, i) => (
          <li
            key={i}
            aria-hidden={i >= skills.length}
            className={cn(
              'whitespace-nowrap px-6 text-lg md:px-9 md:text-xl',
              skill.highlight ? 'font-semibold text-zinc-200' : 'font-medium text-zinc-600',
            )}
          >
            {skill.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
