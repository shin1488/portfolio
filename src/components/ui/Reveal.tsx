import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface RevealProps {
  /** 등장 시차(ms) — 형제 요소들을 계단식으로 띄울 때 사용 */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * 뷰포트에 들어올 때 아래에서 떠오르며 나타나는 래퍼.
 * 동작 줄이기(prefers-reduced-motion) 설정 시 애니메이션 없이 즉시 표시한다.
 */
export function Reveal({ delay = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    // 요소가 조금이라도 걸치면 바로 켠다 — 임계값이나 음수 여백을 두면 빠르게 스크롤할 때
    // 콘텐츠가 화면에 들어온 뒤에야 뒤늦게 떠올라 따라오지 못하는 느낌이 난다.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px 120px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-300 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      )}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
