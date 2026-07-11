import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { scrollToTrackStep } from '@/lib/section';
import { useStickyProgress } from '@/lib/useStickyProgress';

interface IntroductionSectionProps {
  bio: string[];
}

/**
 * Introduction — 핀 고정 read-along. 스크롤 진행도에 따라 자기소개 문단을 하나씩 강조한다.
 * 상단 진행 dot(클릭 시 해당 문단으로), 좌측 인디고 바 + 문단 색 전환. 문단 hover로도 활성.
 * 모바일: 핀 없이 전 문단을 펼친다.
 */
export function IntroductionSection({ bio }: IntroductionSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const n = bio.length;
  const scrollIdx = useStickyProgress(trackRef, n, hoverIdx !== null);
  const active = hoverIdx ?? scrollIdx;

  // 스크롤하는 동안에는 호버 잠금을 해제한다 — 마우스가 문단 위에 멈춰 있어도 스크롤로 활성 문단이 진행되게.
  // (스크롤이 멈춘 뒤 마우스를 움직이면 onMouseMove로 호버가 다시 걸린다)
  useEffect(() => {
    const onScroll = () => setHoverIdx((h) => (h === null ? h : null));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!n) return null;

  return (
    <section id="about" aria-label="Introduction" className="scroll-mt-14">
      {/* 데스크톱: 핀 고정 read-along (문단당 넉넉한 스크롤 배분) */}
      <div ref={trackRef} className="relative hidden sm:block" style={{ height: `${100 + n * 24}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto w-full max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight">Introduction</h2>

            <div className="mt-4 flex justify-center gap-2">
              {bio.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i + 1}번째 문단으로 이동`}
                  aria-current={i === active}
                  onClick={() => scrollToTrackStep(trackRef.current, i, n)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-250',
                    i === active ? 'w-6.5 bg-linear-to-r from-indigo-400 to-pink-400' : 'w-1.5 bg-zinc-700',
                  )}
                />
              ))}
            </div>

            <div
              onMouseLeave={() => setHoverIdx(null)}
              className="mx-auto mt-12 flex max-w-190 flex-col gap-7.5"
            >
              {bio.map((paragraph, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseMove={() => setHoverIdx(i)}
                  className="flex items-stretch gap-5.5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'w-0.75 shrink-0 rounded-sm transition-colors duration-350',
                      i === active ? 'bg-linear-to-b from-indigo-400 to-pink-400' : 'bg-zinc-800',
                    )}
                  />
                  <p
                    className={cn(
                      'text-lg leading-[1.9] transition-colors duration-350',
                      i === active ? 'text-zinc-100' : 'text-zinc-600',
                    )}
                  >
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일: 핀 없이 전 문단 펼침 */}
      <div className="mx-auto max-w-2xl px-6 py-14 sm:hidden">
        <h2 className="text-center text-xl font-bold tracking-tight">Introduction</h2>
        <div className="mt-8 space-y-7">
          {bio.map((paragraph, i) => (
            <p key={i} className="leading-[1.8] text-zinc-300">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
