import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm',
        // 다크 테마: 반투명 유리질 — 뒤의 앰비언트 그라데이션이 비쳐 든다.
        // backdrop-blur로 배경을 흐려 유리 질감을, 흰색 테두리로 유리 모서리를 낸다.
        'dark:border-white/10 dark:bg-white/[0.04] dark:shadow-xl dark:shadow-black/20 dark:backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
