import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import type { SectionId } from '@/lib/nav';
import { Frame } from './Frame';

interface SectionProps {
  id: SectionId;
  /** 도면 좌표처럼 붙는 두 자리 순번 — '01', '02' */
  index: string;
  /** 우측 모노 라벨에 쓰는 영문 슬러그 — 'about'이면 `01 · about/`으로 표시된다 */
  slug: string;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * 프레임 안에 놓이는 본문 섹션 — 좌측 제목·설명과 우측 모노 인덱스로 이루어진 헤더 아래,
 * 가로 hairline을 경계로 콘텐츠 격자가 붙는다. 모든 섹션이 이 골격을 공유하므로
 * 페이지 전체가 하나의 도면처럼 이어져 읽힌다.
 */
export function Section({ id, index, slug, title, description, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-11">
      <Frame>
        <Reveal>
          <div className="flex items-start justify-between gap-6 border-b border-divider px-5 py-8 md:px-8 md:py-11">
            <div>
              <h2
                id={headingId}
                className="text-2xl font-bold tracking-[-0.025em] text-zinc-100 md:text-[30px]"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-[15px]">
                  {description}
                </p>
              )}
            </div>
            <span
              aria-hidden="true"
              className="mt-1.5 shrink-0 font-mono text-[11px] text-zinc-500"
            >
              {index} · {slug}/
            </span>
          </div>
        </Reveal>
        {children}
      </Frame>
    </section>
  );
}
