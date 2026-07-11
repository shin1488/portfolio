import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useStickyProgress } from '@/lib/useStickyProgress';
import type { SkillCategory } from '@/types/content';

interface SkillsSectionProps {
  categories: SkillCategory[];
}

// 좌측 메뉴 각 행 높이(px) — 이동 바 translateY 계산과 공유
const ROW_H = 52;

/**
 * Skills — 핀 고정 스텝스루. 세로로 긴 트랙 안에 sticky 패널을 두고, 트랙을 지나는
 * 스크롤 진행도를 카테고리 인덱스로 매핑한다(호버 시엔 그 항목을 우선). 좌측 타이포 메뉴
 * (제목만, 개수 숫자 없음)에서 활성 항목만 강조되고, 우측에 그 카테고리 스킬이 2열로 나온다.
 * 정중앙 세로 divider = 제목 글자 중앙(minmax(0,1fr) 2열 + gap 0). 좌우 콘텐츠는 세로 중앙 정렬.
 * 모바일: 핀 없이 전 카테고리를 펼친다.
 */
export function SkillsSection({ categories }: SkillsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const n = categories.length;
  const scrollIdx = useStickyProgress(trackRef, n, hoverIdx !== null);
  const active = hoverIdx ?? scrollIdx;

  // 스크롤하는 동안에는 호버 잠금을 해제한다 — 마우스가 항목 위에 멈춰 있어도 스크롤로 활성 항목이 진행되게.
  // (스크롤이 멈춘 뒤 마우스를 움직이면 onMouseMove로 호버가 다시 걸린다)
  useEffect(() => {
    const onScroll = () => setHoverIdx((h) => (h === null ? h : null));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!n) return null;
  const activeCat = categories[active] ?? categories[0];

  return (
    <section id="skills" aria-label="Skills" className="scroll-mt-14">
      {/* 데스크톱: 핀 고정 스텝스루 (트랙 = 100vh + 카테고리당 24vh) */}
      <div ref={trackRef} className="relative hidden sm:block" style={{ height: `${100 + n * 24}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto w-full max-w-5xl px-6">
            <h2 className="mb-11 text-center text-3xl font-bold tracking-tight">Skills</h2>

            <div
              onMouseLeave={() => setHoverIdx(null)}
              className="grid items-stretch gap-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              {/* 좌측 타이포 메뉴 + 이동 바 — 세로 중앙 */}
              <div className="flex items-center pr-10">
                <div className="relative w-full pl-5.5">
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-3.75 h-5.5 w-0.75 rounded-sm bg-linear-to-b from-indigo-400 to-pink-400"
                    style={{
                      transform: `translateY(${active * ROW_H}px)`,
                      transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                  {categories.map((category, i) => (
                    <button
                      key={category.id}
                      type="button"
                      aria-current={i === active}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseMove={() => setHoverIdx(i)}
                      onFocus={() => setHoverIdx(i)}
                      className="flex w-full items-center text-left"
                      style={{ height: ROW_H }}
                    >
                      <span
                        className={cn(
                          'text-[23px] font-bold tracking-[-0.01em] transition-colors duration-250',
                          i === active ? 'text-zinc-100' : 'text-zinc-600',
                        )}
                      >
                        {category.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 우측: 활성 카테고리 스킬 2열 — 세로 중앙 (min-height로 divider 길이 고정) */}
              <div className="flex min-h-80 items-center border-l border-zinc-800 pl-10">
                {/* overflow-hidden + -mt-px로 두 컬럼 맨 윗줄의 border-t만 잘라내 상단 가로줄을 없앤다
                    (컬럼 최상단 항목들의 top이 같은 y라 1px 클립으로 좌우 대칭 제거, 행 사이 divider는 유지) */}
                <div className="w-full overflow-hidden">
                  <ul className="-mt-px w-full columns-2 gap-x-8">
                    {activeCat.skills.map((skill) => (
                      <li
                        key={skill.name}
                        className="break-inside-avoid border-t border-zinc-800/60 py-2.25"
                      >
                        <span
                          className={cn(
                            'text-base',
                            skill.highlight
                              ? 'font-semibold text-indigo-300'
                              : 'font-medium text-zinc-300',
                          )}
                        >
                          {skill.name}
                          {skill.highlight && <span className="sr-only"> (주력)</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일: 핀 없이 전 카테고리를 펼친다 */}
      <div className="mx-auto max-w-5xl px-6 py-14 sm:hidden">
        <h2 className="text-center text-xl font-bold tracking-tight">Skills</h2>
        <div className="mt-8 space-y-9">
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="border-b border-zinc-600 pb-2 text-base font-bold text-zinc-100">
                {category.title}
              </h3>
              <ul className="mt-3 columns-2 gap-x-6">
                {category.skills.map((skill) => (
                  <li key={skill.name} className="break-inside-avoid py-1.5">
                    <span
                      className={cn(
                        'text-sm',
                        skill.highlight ? 'font-semibold text-indigo-300' : 'text-zinc-300',
                      )}
                    >
                      {skill.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
