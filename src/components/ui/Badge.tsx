import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'accent';

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-divider text-zinc-400',
  accent: 'border-accent/60 text-accent',
};

/**
 * 기술 스택 등에 붙는 칩 — 홈 카드의 기술 pill과 같은 규격이다(라운드 없이 hairline 테두리 + 모노).
 * 상세 페이지와 홈이 같은 컴포넌트를 쓰지 않더라도 눈에는 같은 칩으로 보이도록 여기서 규격을 맞춘다.
 */
export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2 py-1 font-mono text-[11px]',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
