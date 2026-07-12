import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';
import type { CareerCategory } from '@/types/content';

interface CareersSectionProps {
  categories: CareerCategory[];
}

/**
 * Careers — 학력·활동·수상·자격증을 카테고리별 격자 칸에 담는다.
 * 각 칸은 모노 카테고리 라벨 아래에 날짜·이름·설명 순으로 항목을 세로로 쌓는다.
 */
export function CareersSection({ categories }: CareersSectionProps) {
  if (!categories.length) return null;

  return (
    <Section id="careers" index="04" slug="careers" title="Careers" glow="emerald" glowSide="left">
      <div className="grid [&>*:first-child]:border-t-0 [&>*]:border-t [&>*]:border-divider md:grid-cols-2 md:[&>*:nth-child(2)]:border-t-0 md:[&>*:nth-child(odd)]:border-r">
        {categories.map((category, i) => (
          <div key={category.id} className="px-5 py-7 md:px-8 md:py-9">
            <Reveal delay={(i % 2) * 90}>
              <p className="font-mono text-[11px] text-zinc-500">{category.title}/</p>
              <ul className="mt-5 flex flex-col gap-6">
                {category.items.map((item, j) => (
                  <li key={j} className="grid gap-1">
                    <span className="font-mono text-[11px] tabular-nums text-zinc-500">
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
      </div>
    </Section>
  );
}
