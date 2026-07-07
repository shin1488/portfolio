import { cn } from '@/lib/cn';

// 7×7 격자 좌표(42×42 viewBox, 간격 6). 점마다 의사난수 지연을 흩뿌려 무작위 깜빡임을 만든다.
const GRID = Array.from({ length: 49 }, (_, i) => ({
  cx: 3 + (i % 7) * 6,
  cy: 3 + Math.floor(i / 7) * 6,
  // 21과 서로소인 13을 곱해 인접 점의 위상을 멀리 흩뿌린다(순차 웨이브 방지, 결정적).
  delay: -((i * 13 + 5) % 21) * 0.05,
}));

/**
 * 이미지 로딩 등 대기 상태용 플리커 스피너 — 7×7 점 격자가 무작위로 켜졌다 꺼진다.
 * 배경 없이 점만 그리며 색은 currentColor를 따른다(부모 text-* 로 제어).
 * prefers-reduced-motion에선 애니메이션 없이 정지 상태로 보인다.
 */
export function FlickerSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 42 42"
      role="status"
      aria-label="불러오는 중"
      className={cn('size-9', className)}
    >
      {GRID.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r="2"
          fill="currentColor"
          className="flicker-dot"
          // 애니메이션 중엔 keyframe이 opacity를 덮어쓰고, reduced-motion(정지)에선 이 값이 보인다
          style={{ animationDelay: `${dot.delay}s`, opacity: 0.4 }}
        />
      ))}
    </svg>
  );
}
