import { useEffect, useRef, type RefObject } from 'react';
import { cn } from '@/lib/cn';

interface ScrollProgressBarProps {
  /** 스크롤을 읽을 컨테이너. 없으면 문서(window) 스크롤을 읽는다. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** 'x'는 좌→우로 차는 가로 바, 'y'는 위→아래로 차는 세로 바 */
  orientation?: 'x' | 'y';
  className?: string;
}

/**
 * 읽기 진행 바 — 헤더(문서 스크롤)와 팝업(패널 내부 스크롤)이 함께 쓴다.
 *
 * 진행률을 React state로 들고 있지 않는다. 매 프레임 setState를 하면 그 컴포넌트 트리 전체가
 * 다시 렌더되고(헤더의 경우 내비·드로어까지), width를 바꾸면 매 프레임 레이아웃·페인트가 다시
 * 돈다. 그래서 바가 24fps처럼 뚝뚝 끊겨 보인다. 대신 ref로 DOM을 직접 잡아 transform: scale만
 * 갱신한다 — 컴포지터에서 처리되므로 레이아웃·페인트가 없고 React 렌더도 일어나지 않는다.
 */
export function ScrollProgressBar({
  scrollRef,
  orientation = 'x',
  className,
}: ScrollProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target: HTMLElement | Window = scrollRef?.current ?? window;
    let frame = 0;

    const read = () => {
      frame = 0;
      let ratio = 0;
      if (target === window) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      } else {
        const el = target as HTMLElement;
        const scrollable = el.scrollHeight - el.clientHeight;
        ratio = scrollable > 0 ? el.scrollTop / scrollable : 0;
      }
      ratio = Math.min(1, Math.max(0, ratio));
      const fill = fillRef.current;
      if (fill) {
        fill.style.transform = orientation === 'x' ? `scaleX(${ratio})` : `scaleY(${ratio})`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollRef, orientation]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'overflow-hidden bg-zinc-800/60',
        orientation === 'x' ? 'h-0.75' : 'w-0.75',
        className,
      )}
    >
      {/* 초기 상태(0)도 클래스가 아니라 인라인 transform으로 준다 — Tailwind의 scale-x-0/scale-y-0은
          transform이 아니라 표준 `scale` 속성을 쓰고, 이 속성은 transform 위에 곱해져서 인라인
          transform을 0으로 눌러 버린다(바가 영영 안 차던 원인). */}
      <div
        ref={fillRef}
        style={{ transform: orientation === 'x' ? 'scaleX(0)' : 'scaleY(0)' }}
        className={cn(
          'size-full from-accent to-accent-end',
          orientation === 'x' ? 'origin-left bg-linear-to-r' : 'origin-top bg-linear-to-b',
        )}
      />
    </div>
  );
}
