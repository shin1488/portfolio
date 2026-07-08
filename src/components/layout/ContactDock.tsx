import { SocialIcon } from '@/components/ui/SocialIcon';
import type { SocialLink } from '@/types/content';

interface ContactDockProps {
  links: SocialLink[];
}

/** 화면 하단 중앙에 고정되는 연락처 독 — 스크롤 위치와 무관하게 연락 수단에 바로 접근한다 */
export function ContactDock({ links }: ContactDockProps) {
  return (
    <nav aria-label="연락처" className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2">
      <ul className="flex items-center gap-1 rounded-full border border-zinc-200/70 bg-white/80 p-1.5 shadow-lg backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/80">
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
