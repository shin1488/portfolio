import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import type { SectionId } from '@/lib/nav';
import { Frame } from './Frame';

/**
 * 섹션 제목 뒤에 깔리는 글로우 색 — PSR 타임라인(문제·해결·결과)과 같은 세 색이다.
 * 블루·그린은 사이트 액센트 토큰을 그대로 참조하고, rose만 액센트 밖의 색으로 남는다.
 */
export const SECTION_GLOW = {
  rose: '#fb7185',
  blue: 'var(--color-accent-end)',
  green: 'var(--color-accent)',
} as const;

export type SectionGlow = keyof typeof SECTION_GLOW;

interface SectionProps {
  id: SectionId;
  /** 도면 좌표처럼 붙는 두 자리 순번 — '01', '02' */
  index: string;
  /** 우측 모노 라벨에 쓰는 영문 슬러그 — 'about'이면 `01 · about/`으로 표시된다 */
  slug: string;
  title: string;
  description?: string;
  /** 제목 뒤 글로우 색. 없으면 글로우를 그리지 않는다. */
  glow?: SectionGlow;
  /** 글로우를 프레임의 어느 쪽에 붙일지 */
  glowSide?: 'left' | 'right';
  children: ReactNode;
}

/**
 * 프레임 안에 놓이는 본문 섹션 — 좌측 제목·설명과 우측 모노 인덱스로 이루어진 헤더 아래,
 * 가로 hairline을 경계로 콘텐츠 격자가 붙는다. 모든 섹션이 이 골격을 공유하므로
 * 페이지 전체가 하나의 도면처럼 이어져 읽힌다.
 */
export function Section({
  id,
  index,
  slug,
  title,
  description,
  glow,
  glowSide = 'left',
  children,
}: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-11">
      {/* overflow-hidden: 글로우가 프레임 세로선 밖으로 새지 않게 잘라낸다 */}
      <Frame className="relative overflow-hidden">
        {glow && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-72"
            style={{
              backgroundImage: `radial-gradient(46% 100% at ${
                glowSide === 'left' ? '4%' : '96%'
              } 0%, color-mix(in srgb, ${SECTION_GLOW[glow]} 22%, transparent), transparent 70%)`,
            }}
          />
        )}
        <Reveal>
          <div className="relative flex items-start justify-between gap-6 border-b border-divider px-5 py-8 md:px-8 md:py-11">
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
