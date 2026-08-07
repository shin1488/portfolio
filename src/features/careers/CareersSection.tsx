import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';
import type { CareerCategory } from '@/types/content';

interface CareersSectionProps {
  categories: CareerCategory[];
}

/**
 * Careers — 학력·활동·수상·자격증을 카테고리별 격자 칸에 담는다.
 * 각 칸은 카테고리 라벨 아래에 날짜·이름·설명 순으로 항목을 세로로 쌓는다.
 */
export function CareersSection({ categories }: CareersSectionProps) {
  if (!categories.length) return null;

  return (
    <Section id="careers" index="05" slug="careers" title="Careers" glow="green" glowSide="left">
      {/* 세로 divider는 절대 위치 선 — 셀에 border-r을 주면 그 칸의 콘텐츠 폭만 1px 좁아진다 */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-divider md:block"
        />
        <div className="grid [&>*:first-child]:border-t-0 [&>*]:border-t [&>*]:border-divider md:grid-cols-2 md:[&>*:nth-child(2)]:border-t-0">
          {categories.map((category, i) => (
            <div key={category.id} className="px-5 py-7 md:px-8 md:py-9">
              <Reveal delay={(i % 2) * 90}>
                <p className="text-[11px] text-zinc-500">{category.title}/</p>
                <ul className="mt-5 flex flex-col gap-6">
                  {category.items.map((item, j) => (
                    <li key={j} className="grid gap-1">
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        {item.date}
                      </span>
                      <p className="text-[15px] font-semibold text-zinc-100">{item.name}</p>
                      {item.description && (
                        <p className="text-[13px] leading-[1.65] text-zinc-400">
                          {item.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          ))}
          {/* 칸이 홀수면 마지막 행의 오른쪽이 비고, 그 자리를 지나야 할 가로선까지 함께 사라진다.
              가로선은 각 칸의 위 테두리로 그리므로 칸이 없으면 선도 없다. 빈 칸을 하나 두어 선만
              잇는다. 한 줄로 접히는 좁은 화면에서는 빈 행이 되므로 감춘다. */}
          {categories.length % 2 === 1 && <div aria-hidden="true" className="hidden md:block" />}
        </div>
      </div>
    </Section>
  );
}
