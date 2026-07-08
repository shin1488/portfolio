import { SocialIcon } from '@/components/ui/SocialIcon';
import type { SocialLink } from '@/types/content';

interface ContactDockProps {
  links: SocialLink[];
}

/** 화면 하단 중앙에 고정되는 연락처 독 — 스크롤 위치와 무관하게 연락 수단에 바로 접근한다 */
export function ContactDock({ links }: ContactDockProps) {
  return (
    <nav aria-label="연락처" className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2">
      {/* 필 배경은 fixed 요소 자체가 아닌 absolute 자식에 — iOS 26 Safari는 하단에 보이는
          fixed 요소의 배경색으로 하단 바를 칠하는데, absolute 자식은 샘플링에서 무시된다.
          blur는 iOS(-webkit-touch-callout 지원 환경)에서만 끄고 불투명도로 보상 —
          하단 바 영역에 backdrop-filter 레이어가 있으면 Safari가 바 글래스를 렌더하지
          못하고 불투명 단색(다크모드=검정)으로 플래튼시켜 검은 띠가 된다. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-zinc-200/70 bg-white/80 shadow-lg backdrop-blur-md supports-[-webkit-touch-callout:none]:bg-white/95 supports-[-webkit-touch-callout:none]:backdrop-blur-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:supports-[-webkit-touch-callout:none]:bg-zinc-900/95"
      />
      <ul className="relative flex items-center gap-1 p-1.5">
        {links.map((link, index) => {
          const opensNewTab = /^https?:/i.test(link.href);
          return (
            <li key={index}>
              <a
                href={link.href}
                {...(opensNewTab ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <SocialIcon kind={link.kind} />
                {link.label}
                {opensNewTab && <span className="sr-only"> (새 탭에서 열림)</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
