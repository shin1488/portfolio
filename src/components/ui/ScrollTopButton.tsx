import { cn } from '@/lib/cn';

interface ScrollTopButtonProps {
  /** 보일지 여부 — 일정 이상 내려왔을 때만 떠오른다 */
  visible: boolean;
  onClick: () => void;
  /** 위치 지정용(fixed/absolute + 좌표) — 호출부가 어디에 띄울지 정한다 */
  className?: string;
}

/**
 * 맨 위로 버튼 — 상세 페이지(문서 스크롤)와 팝업(패널 내부 스크롤)이 함께 쓴다.
 * 배경은 버튼 자체가 아닌 absolute 자식에 둔다 — iOS 26 Safari가 하단에 보이는 fixed 요소의
 * 배경색으로 하단 바를 칠하는데, absolute 자식은 그 샘플링에서 무시된다.
 */
export function ScrollTopButton({ visible, onClick, className }: ScrollTopButtonProps) {
  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={onClick}
      className={cn(
        'group flex size-11 cursor-pointer items-center justify-center text-zinc-200 transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        className,
      )}
    >
      {/* blur는 iOS(-webkit-touch-callout 지원 환경)에서만 끄고 불투명도로 보상 — 하단 바 영역에
          backdrop-filter 레이어가 있으면 Safari가 바 글래스를 검정 단색으로 플래튼시킨다. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-divider bg-zinc-900/80 shadow-lg backdrop-blur-md transition-colors group-hover:border-accent/60 group-hover:bg-zinc-800 supports-[-webkit-touch-callout:none]:bg-zinc-900 supports-[-webkit-touch-callout:none]:backdrop-blur-none"
      />
      <svg
        viewBox="0 0 24 24"
        className="relative size-5 transition-colors group-hover:text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
