import { useLocation, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/lib/nav';
import { scrollToSection, useActiveSection } from '@/lib/section';
import { SITE_NAME } from '@/lib/site';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';
  const active = useActiveSection(onHome ? NAV_ITEMS.map((item) => item.id) : []);

  // 홈에선 rail과 동일한 JS 스크롤(오프셋 0), 상세 등 다른 페이지에선 홈으로 이동하며 앵커 지정
  const go = (id: string) => {
    if (onHome && document.getElementById(id)) scrollToSection(id);
    else navigate(`/#${id}`);
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-zinc-950/55 backdrop-blur-lg backdrop-saturate-[1.4]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <button
          type="button"
          onClick={() => go('profile')}
          className="text-sm font-semibold tracking-tight text-zinc-100"
        >
          {SITE_NAME}
        </button>
        <nav aria-label="주요 섹션">
          <ul className="flex items-center gap-[22px] text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={onHome && item.id === active}
                  className={cn(
                    'transition-colors',
                    onHome && item.id === active
                      ? 'text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200',
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
