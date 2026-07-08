import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { content } from '@/data';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/lib/nav';
import { scrollToSection, useActiveSection } from '@/lib/section';
import { SITE_NAME } from '@/lib/site';
import { useScrollProgress } from '@/lib/useScroll';

/**
 * 반응형 헤더.
 * - 데스크톱(sm+): 기존 인라인 내비 그대로.
 * - 모바일(<sm): 인라인 내비 대신 햄버거 → 풀스크린 드로어(큰 메뉴 + 연락처).
 * 로고/활성 표시/스크롤 이동 로직은 기존과 동일(홈은 오프셋 0 스크롤, 그 외엔 /#id로 이동).
 */
export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const onHome = location.pathname === '/';
  const homeActive = useActiveSection(onHome ? NAV_ITEMS.map((item) => item.id) : []);
  const active = onHome
    ? homeActive
    : location.pathname.startsWith('/projects/')
      ? 'projects'
      : '';

  const go = (id: string) => {
    setMenuOpen(false);
    if (onHome && document.getElementById(id)) scrollToSection(id);
    else navigate(`/#${id}`);
  };

  // 드로어가 열려 있는 동안 배경 스크롤 잠금 + ESC로 닫기.
  // 잠금은 body가 아닌 html(overflowY)에 건다 — html에 overflow-x: clip이 있어 body의
  // overflow가 뷰포트로 승격되지 않으므로, body에 걸면 body가 클리핑 컨테이너가 되어
  // sticky 헤더가 문서 최상단으로 튀어 버린다(잠금도 무력화).
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowY = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflowY = prevOverflowY;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    // transform-gpu: backdrop-filter 있는 sticky가 iOS 스크롤 중 밀려 보이는 WebKit 이슈 완화(자체 레이어 승격)
    <header className="sticky top-0 z-30 h-14 transform-gpu border-b border-white/[0.06] bg-zinc-950/55 backdrop-blur-lg backdrop-saturate-[1.4]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <button
          type="button"
          onClick={() => go('profile')}
          className="group flex cursor-pointer items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          <span className="bg-linear-to-r from-indigo-400 via-pink-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-zinc-100 transition-colors duration-200 group-hover:animate-[logo-flow_3s_linear_infinite] group-hover:text-transparent">
            {SITE_NAME}
          </span>
        </button>

        {/* 데스크톱 내비 (sm+) */}
        <nav aria-label="주요 섹션" className="hidden sm:block">
          <ul className="flex items-center gap-[22px] text-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === active;
              return (
                <li key={item.id}>
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

        {/* 모바일 햄버거 (<sm) — 같은 버튼이 그 자리에서 X로 모프되는 토글.
            메뉴는 새 레이어가 아니라 헤더가 아래로 확장되는 형태라 버튼이 가려지지 않는다. */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          className="-mr-2 flex cursor-pointer flex-col items-end gap-[5px] p-2 sm:hidden"
        >
          <span
            className={cn(
              'h-0.5 w-5 rounded-full bg-zinc-300 transition-transform duration-300',
              menuOpen && 'translate-y-[7px] rotate-45',
            )}
          />
          <span
            className={cn(
              'h-0.5 w-5 rounded-full bg-zinc-300 transition-opacity duration-300',
              menuOpen && 'opacity-0',
            )}
          />
          <span
            className={cn(
              'h-0.5 rounded-full bg-zinc-300 transition-all duration-300',
              menuOpen ? 'w-5 -translate-y-[7px] -rotate-45' : 'w-3.5',
            )}
          />
        </button>
      </div>

      {/* 상세 페이지 읽기 진행 바(lg 미만) — fixed가 아닌 헤더의 absolute 자식으로 붙여,
          iOS 러버밴드로 헤더가 딸려 움직일 때도 바가 헤더와 한 몸으로 따라간다. */}
      {location.pathname.startsWith('/projects/') && <ReadingProgressBar />}

      {/* 메뉴 패널은 body 포털로 렌더 — 헤더의 backdrop-filter가 fixed 자손의 containing block이
          되어 위치가 헤더 기준으로 좁혀지는 것을 피한다. 헤더 아래(top-14)에서 펼쳐진다. */}
      {createPortal(
        <MobileDrawer open={menuOpen} active={active} onGo={go} />,
        document.body,
      )}
    </header>
  );
}

/** 모바일·태블릿 읽기 진행 바 — 헤더 바로 아래에서 좌→우로 찬다(데스크톱은 좌측 세로 바가 담당) */
function ReadingProgressBar() {
  const { progress } = useScrollProgress();
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-full h-[3px] overflow-hidden bg-zinc-200/50 lg:hidden dark:bg-zinc-800/60"
    >
      <div
        className="h-full rounded-r-full bg-linear-to-r from-indigo-500 to-pink-500"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

function MobileDrawer({
  open,
  active,
  onGo,
}: {
  open: boolean;
  active: string;
  onGo: (id: string) => void;
}) {
  return (
    // 클리핑 래퍼 — 헤더 바로 아래(top-14)만 차지한다. 패널이 이 안에서 내려오므로
    // 새 레이어가 화면을 덮는 게 아니라 '헤더가 아래로 확장'되는 것처럼 보인다.
    <div
      aria-hidden={!open}
      className="pointer-events-none fixed inset-x-0 bottom-0 top-14 z-40 overflow-hidden sm:hidden"
    >
      <div
        className={cn(
          // visibility는 전환이 끝난 뒤 바뀌므로 닫힘 애니메이션이 살아있고, 닫힌 상태에선
          // invisible이라 포커스/클릭 대상에서 빠진다.
          // v4의 translate-y-*는 transform이 아닌 translate 속성을 쓰므로 transition 대상도 translate.
          // 배경: 검은 판 대신 프로스트 글래스 — 투명도를 낮추되 블러를 세게 걸어
          // 뒤 콘텐츠는 읽히지 않는 색 번짐만 남긴다(비침 없이 유리 질감).
          'relative flex h-full flex-col bg-zinc-950/80 backdrop-blur-2xl backdrop-saturate-[1.4] transition-[translate,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'pointer-events-auto visible translate-y-0' : 'invisible -translate-y-full',
        )}
      >
      {/* 패널 안쪽 브랜드 글로우 — 자체 생기를 주는 은은한 인디고/핑크 광 (비침과 무관한 장식) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(42% 34% at 18% 12%, rgba(99,102,241,0.13), transparent 70%),' +
            'radial-gradient(46% 38% at 88% 78%, rgba(236,72,153,0.09), transparent 70%)',
        }}
      />
      {/* 큰 메뉴 */}
      <nav aria-label="주요 섹션" className="px-6 pt-6">
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
          Menu
        </p>
        <ul>
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onGo(item.id)}
                  aria-current={isActive}
                  className="flex w-full cursor-pointer items-center justify-between border-b border-white/5 py-3 text-left"
                >
                  {/* 회색/그라데 라벨을 겹쳐 두고 활성 시 그라데만 페이드(깜빡임 없음) */}
                  <span className="grid text-[26px] font-bold tracking-[-0.01em]">
                    <span className={cn('col-start-1 row-start-1 text-zinc-200', isActive && 'opacity-0')}>
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
                  </span>
                  {isActive && (
                    <span aria-hidden="true" className="size-[7px] rounded-full bg-linear-to-br from-indigo-400 to-pink-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 연락처 */}
      <div className="px-6 pt-9">
        <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
          Contact
        </p>
        <ul className="flex flex-col gap-1">
          {content.profile.links.map((link, index) => {
            const opensNewTab = /^https?:/i.test(link.href);
            return (
              <li key={index}>
                <a
                  href={link.href}
                  {...(opensNewTab ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="inline-flex items-center gap-2.5 py-2 text-[15px] text-zinc-300"
                >
                  <SocialIcon kind={link.kind} />
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      </div>
    </div>
  );
}
