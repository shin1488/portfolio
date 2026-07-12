import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FrameProps {
  className?: string;
  children?: ReactNode;
}

/**
 * 페이지를 관통하는 프레임 — 좌우 hairline이 히어로부터 푸터까지 한 줄로 이어져
 * 모든 섹션을 같은 도면 위에 올린다. 폭과 경계선을 이 컴포넌트 한 곳에서만 정의하므로,
 * 섹션이 늘어나도 세로선이 어긋나지 않는다.
 */
export function Frame({ className, children }: FrameProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl border-x border-divider', className)}>
      {children}
    </div>
  );
}

/**
 * 섹션 사이 구분대 — 화면 끝까지 뻗는 가로 hairline 두 줄 사이에 45° 빗금 밴드를 둔다.
 * 프레임 세로선과 가로선이 만나는 지점에는 도면의 기준점처럼 십자 마크를 찍는다.
 */
export function HatchDivider() {
  return (
    <div aria-hidden="true" className="border-y border-divider">
      <Frame className="hatch relative h-5 md:h-8">
        <CrossMark className="left-0" />
        <CrossMark className="left-full" />
      </Frame>
    </div>
  );
}

/** 프레임 세로선 위에 겹쳐 찍는 십자 마크 — 세로선을 절반씩 물고 중앙에 앉는다. */
function CrossMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2',
        className,
      )}
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-zinc-600" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-zinc-600" />
    </span>
  );
}
