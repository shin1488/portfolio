import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { isProgrammaticScroll, scrollToTrackStep } from '@/lib/section';
import { useStickyProgress } from '@/lib/useStickyProgress';
import type { CareerCategory } from '@/types/content';

interface CareersSectionProps {
  categories: CareerCategory[];
}

const ROW_H = 52;

/**
 * Careers — Skills와 동일한 핀 고정 스텝스루. 좌측 카테고리 메뉴(학력·활동·수상·자격증),
 * 우측에 활성 카테고리의 항목(날짜·이름·설명) 리스트. 좌우 콘텐츠는 세로 중앙 정렬.
 * 모바일은 핀 없이 펼친다.
 */
export function CareersSection({ categories }: CareersSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const n = categories.length;
  // paused를 쓰지 않는다 — 호버 중 scrollIdx를 멈춰두면 값이 낡아서, 호버가 풀리는 순간
  // 한 프레임 동안 낡은(이전) 항목이 비친다. 호버 우선순위는 아래 `hoverIdx ?? scrollIdx`가 이미 보장.
  const scrollIdx = useStickyProgress(trackRef, n);
  const active = hoverIdx ?? scrollIdx;

  // 스크롤하는 동안에는 호버 잠금을 해제한다 — 마우스가 항목 위에 멈춰 있어도 스크롤로 활성 항목이 진행되게.
  // (스크롤이 멈춘 뒤 마우스를 움직이면 onMouseMove로 호버가 다시 걸린다)
  useEffect(() => {
    const onScroll = () => {
      // 클릭에 의한 프로그래매틱 스크롤에선 호버 선택을 유지한다 — 여기서 풀어버리면
      // scrollIdx가 아직 rAF로 갱신되기 전(이전 값)이라, 한 프레임 동안 이전 항목이 비쳐 깜빡인다.
      if (isProgrammaticScroll()) return;
      setHoverIdx((h) => (h === null ? h : null));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!n) return null;
  const activeCat = categories[active] ?? categories[0];

  return (
    <section id="careers" aria-label="Careers" className="scroll-mt-14">
      {/* 데스크톱: 핀 고정 스텝스루 */}
      <div ref={trackRef} className="relative hidden sm:block" style={{ height: `${100 + n * 25}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto w-full max-w-5xl px-6">
            <h2 className="mb-11 text-center text-3xl font-bold tracking-tight">Careers</h2>

            <div
              onMouseLeave={() => setHoverIdx(null)}
              className="grid items-stretch gap-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              {/* 좌측 메뉴 + 이동 바 — 세로 중앙 */}
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
                  {/* 클릭 이동은 instant — smooth면 트랙을 훑고 지나가며 중간 항목들이 차례로
                      활성화돼 깜빡인다. 핀 고정 트랙이라 즉시 이동해도 콘텐츠는 제자리고
                      활성 인덱스만 바뀌어, 전환은 CSS 트랜지션이 부드럽게 처리한다. */}
                  {categories.map((category, i) => (
                    <button
                      key={category.id}
                      type="button"
                      aria-current={i === active}
                      onClick={() => scrollToTrackStep(trackRef.current, i, n, 'instant')}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseMove={() => setHoverIdx(i)}
                      onFocus={() => setHoverIdx(i)}
                      className="flex w-full cursor-pointer items-center text-left"
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

              {/* 우측: 활성 카테고리 항목 — 세로 중앙 */}
              <div className="flex min-h-100 items-center border-l border-zinc-800 pl-10">
                <ul className="flex w-full flex-col gap-5.5">
                  {activeCat.items.map((item, i) => (
                    <li key={i}>
                      <p className="text-[13px] tabular-nums text-zinc-400">
                        <span aria-hidden="true" className="mr-1.5 text-indigo-400">
                          ✦
                        </span>
                        {item.date}
                      </p>
                      <p className="mt-1.25 text-[17px] font-semibold text-zinc-100">{item.name}</p>
                      {item.description && (
                        <p className="mt-0.75 text-sm leading-[1.6] text-zinc-400">
                          {item.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일: 핀 없이 펼침 */}
      <div className="mx-auto max-w-2xl px-6 py-14 sm:hidden">
        <h2 className="text-center text-xl font-bold tracking-tight">Careers</h2>
        <div className="mt-8 space-y-9">
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="border-b border-zinc-600 pb-2 text-base font-bold text-zinc-100">
                {category.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-5">
                {category.items.map((item, i) => (
                  <li key={i}>
                    <p className="text-[13px] tabular-nums text-zinc-400">
                      <span aria-hidden="true" className="mr-1.5 text-indigo-400">
                        ✦
                      </span>
                      {item.date}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-100">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-zinc-400">{item.description}</p>
                    )}
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
