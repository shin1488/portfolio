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
          className="group flex cursor-pointer items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          {/* 평소엔 흰 글자, 호버 시 글자색이 투명해지며 200% 폭 그라데이션이 한 방향으로 계속 흐른다 */}
          <span className="bg-linear-to-r from-indigo-400 via-pink-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-zinc-100 transition-colors duration-200 group-hover:animate-[logo-flow_3s_linear_infinite] group-hover:text-transparent">
            {SITE_NAME}
          </span>
        </button>
        <nav aria-label="주요 섹션">
          <ul className="flex items-center gap-[22px] text-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = onHome && item.id === active;
              return (
                <li key={item.id}>
                  {/* grid로 회색 라벨과 그라데이션 라벨을 정확히 겹쳐 두고, 활성 시 그라데이션만
                      opacity로 페이드 인 한다. bg-clip-text를 껐다 켜지 않아 섹션 전환 때 깜빡임이 없다. */}
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={isActive}
                    className="group grid cursor-pointer"
                  >
                    <span className="col-start-1 row-start-1 text-zinc-400 transition-colors group-hover:text-zinc-200">
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'col-start-1 row-start-1 bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
