import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { content } from '@/data';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/lib/nav';
import { scrollToSection, useActiveSection } from '@/lib/section';
import { SITE_NAME } from '@/lib/site';
import { startRouteTransition } from '@/lib/viewTransition';
import { Frame } from './Frame';

/**
 * 반응형 헤더 — 프레임 폭에 맞춘 44px 바.
 * - 데스크톱(sm+): 인라인 내비. 활성 섹션만 액센트 그라데이션으로 켜진다.
 * - 모바일(<sm): 햄버거 → 헤더가 아래로 확장되는 드로어(큰 메뉴 + 연락처).
 * 로고·활성 표시·스크롤 이동 로직은 동일(홈은 오프셋 0 스크롤, 그 외엔 /#id로 이동).
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
    // 홈에선 스크롤만(라우트 그대로), 다른 페이지에선 홈으로 넘어가며 크로스페이드.
    if (onHome && document.getElementById(id)) {
      scrollToSection(id);
      // 히어로(=문서 최상단)로 돌아갈 때는 주소에 남아 있던 섹션 해시를 지운다. 상세에서 헤더
      // 버튼으로 넘어오면 주소가 /#projects로 남는데, 그대로 두면 로고를 눌러 최상단에 와도
      // 주소는 여전히 그 섹션을 가리켜 새로고침·공유 시 다시 그리로 튄다.
      // navigate() 대신 replaceState를 쓰는 이유: 라우터로 주소를 바꾸면 location.key가 바뀌어
      // ScrollManager가 라우트 전환으로 보고 instant로 최상단에 꽂아 버린다. 그러면 방금 건
      // 부드러운 스크롤이 사라진다. 주소만 갈아 끼우면 렌더도 스크롤도 건드리지 않는다.
      if (id === 'profile' && window.location.hash) {
        const { pathname, search } = window.location;
        window.history.replaceState(window.history.state, '', pathname + search);
      }
    } else {
      // 상세에서 넘어올 때도 히어로는 해시 없는 홈(/)이다. 최상단은 문서의 기본 위치이므로
      // 굳이 /#profile로 표시할 이유가 없고, 그렇게 두면 로고를 눌러 온 주소와 달라진다.
      startRouteTransition(() => navigate(id === 'profile' ? '/' : `/#${id}`));
    }
  };

  // 드로어가 열려 있는 동안 배경 스크롤 잠금 + ESC로 닫기.
  // 잠금은 body가 아닌 html(overflowY)에 건다 — html에 overflow-x: clip이 있어 body의
  // overflow가 뷰포트로 승격되지 않으므로, body에 걸면 body가 클리핑 컨테이너가 되어
  // sticky 헤더가 문서 최상단으로 튀어 버린다(잠금도 무력화).
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowY = 'hidden';
    // iOS Safari는 overflow:hidden만으로 루트 스크롤이 잠기지 않는다(알려진 버그). 레이아웃을
    // 바꾸는 position:fixed 잠금은 sticky 헤더(햄버거/X)를 튀게 하므로, 열려 있는 동안 문서의
    // touchmove(스크롤 드래그)를 직접 막는다. 드로어 패널은 overflow-hidden이라 내부 스크롤이
    // 없어 전체 차단해도 안전하고, 탭(touchstart/end)은 영향받지 않는다.
    const preventTouch = (event: TouchEvent) => event.preventDefault();
    document.addEventListener('touchmove', preventTouch, { passive: false });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflowY = prevOverflowY;
      document.removeEventListener('touchmove', preventTouch);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    // transform-gpu: backdrop-filter 있는 sticky가 iOS 스크롤 중 밀려 보이는 WebKit 이슈 완화(자체 레이어 승격)
    <header className="sticky top-0 z-30 transform-gpu border-b border-divider pt-[env(safe-area-inset-top)]">
      {/* 배경·블러는 sticky 자체가 아닌 absolute 자식에 — iOS 26 Safari가 뷰포트 상단을
          샘플링해 툴바를 칠할 때 sticky 요소 자체의 bg/backdrop-filter를 읽는 것을 피한다 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[#111113]/85 backdrop-blur-lg backdrop-saturate-140"
      />
      <Frame className="flex h-11 items-center justify-between px-5">
        <button
          type="button"
          onClick={() => go('profile')}
          className="group flex cursor-pointer items-center gap-2 text-[13px] font-semibold tracking-tight"
        >
          <img src="/favicon.svg" alt="" aria-hidden="true" className="size-4" />
          <span className="bg-linear-to-r from-accent via-accent-end to-accent bg-size-[200%_auto] bg-clip-text text-zinc-100 transition-colors duration-200 group-hover:animate-[logo-flow_3s_linear_infinite] group-hover:text-transparent">
            {SITE_NAME}
          </span>
        </button>

        {/* 데스크톱 내비 (sm+) */}
        <nav aria-label="주요 섹션" className="hidden sm:block">
          <ul className="flex items-center gap-6 text-[11px]">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === active;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={isActive}
                    className={cn(
                      // 정지 그라데이션 — 흐르는(breathing) 그라데이션은 히어로 역할 문구와
                      // 프로젝트 카드 호버에만 쓴다.
                      'cursor-pointer bg-linear-to-r from-accent to-accent-end bg-clip-text transition-colors',
                      isActive ? 'text-transparent' : 'text-zinc-400 hover:text-zinc-100',
                    )}
                  >
                    {item.label}
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
          className="-mr-2 flex cursor-pointer flex-col items-end gap-1.25 p-2 sm:hidden"
        >
          <span
            className={cn(
              'h-0.5 w-5 rounded-full bg-zinc-300 transition-transform duration-300',
              menuOpen && 'translate-y-1.75 rotate-45',
            )}
          />
          {/* 가운데 막대 — opacity만으로는 iOS WebKit(backdrop-filter 레이어 안 리페인트 버그)에서
              사라지지 않을 수 있어, 컴포지터가 처리하는 scale-x-0을 함께 걸어 확실히 접는다 */}
          <span
            className={cn(
              'h-0.5 w-5 rounded-full bg-zinc-300 transition-all duration-300',
              menuOpen && 'scale-x-0 opacity-0',
            )}
          />
          <span
            className={cn(
              'h-0.5 rounded-full bg-zinc-300 transition-all duration-300',
              menuOpen ? 'w-5 -translate-y-1.75 -rotate-45' : 'w-3.5',
            )}
          />
        </button>
      </Frame>

      {/* 상세 페이지 읽기 진행 바(lg 미만) — fixed가 아닌 헤더의 absolute 자식으로 붙여,
          iOS 러버밴드로 헤더가 딸려 움직일 때도 바가 헤더와 한 몸으로 따라간다. */}
      {location.pathname.startsWith('/projects/') && (
        <ScrollProgressBar className="absolute inset-x-0 top-full lg:hidden" />
      )}

      {/* 메뉴 패널은 body 포털로 렌더 — 헤더의 backdrop-filter가 fixed 자손의 containing block이
          되어 위치가 헤더 기준으로 좁혀지는 것을 피한다. 헤더 아래에서 펼쳐진다. */}
      {createPortal(<MobileDrawer open={menuOpen} active={active} onGo={go} />, document.body)}
    </header>
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
  // 닫힘 상태에선 렌더 트리에서 완전히 제거한다 — iOS 26 Safari는 opacity/visibility로
  // 숨긴 fixed 오버레이의 배경색도 샘플링해 툴바를 어둡게 칠하므로(display:none 필수),
  // 마운트를 2단계로 나눠 여닫이 애니메이션은 유지한다: 열 때 마운트 → 다음 프레임에
  // shown(트랜지션 발동), 닫을 때 shown 해제(슬라이드 업) → 전환 시간 뒤 언마운트.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), 350);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    // 클리핑 래퍼 — 헤더 바로 아래만 차지한다. 패널이 이 안에서 내려오므로
    // 새 레이어가 화면을 덮는 게 아니라 '헤더가 아래로 확장'되는 것처럼 보인다.
    // aria-hidden 대신 inert: 닫히는 순간 방금 클릭한 항목이 아직 포커스를 쥐고 있어도
    // inert가 포커스를 자동으로 걷어내 "aria-hidden on focused element" 경고가 없다.
    <div
      inert={!open}
      className="pointer-events-none fixed inset-x-0 bottom-0 top-[calc(2.75rem+env(safe-area-inset-top))] z-40 overflow-hidden sm:hidden"
    >
      <div
        className={cn(
          // v4의 translate-y-*는 transform이 아닌 translate 속성을 쓰므로 transition 대상도 translate.
          'relative flex h-full flex-col bg-[#111113]/95 backdrop-blur-2xl transition-[translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          shown && open ? 'pointer-events-auto translate-y-0' : '-translate-y-full',
        )}
      >
        {/* 패널 안쪽 액센트 글로우 — 히어로와 같은 그린 라디얼을 옅게 깔아 톤을 잇는다 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(90% 70% at 0% 0%, color-mix(in srgb, var(--color-accent) 24%, transparent), transparent 70%),' +
              'radial-gradient(90% 70% at 100% 100%, color-mix(in srgb, var(--color-accent-end) 32%, transparent), transparent 70%)',
          }}
        />
        {/* 큰 메뉴 */}
        <nav aria-label="주요 섹션" className="px-5 pt-6">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            Menu
          </p>
          <ul>
            {NAV_ITEMS.map((item, i) => {
              const isActive = item.id === active;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onGo(item.id)}
                    aria-current={isActive}
                    className="flex w-full cursor-pointer items-center justify-between border-b border-divider py-3.5 text-left"
                  >
                    <span
                      className={cn(
                        'bg-linear-to-r from-accent to-accent-end bg-clip-text text-[26px] font-bold tracking-[-0.02em] transition-colors',
                        isActive ? 'text-transparent' : 'text-zinc-200',
                      )}
                    >
                      {item.label}
                    </span>
                    <span aria-hidden="true" className="text-[11px] text-zinc-600">
                      {String(i).padStart(2, '0')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 연락처 */}
        <div className="px-5 pt-9">
          <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
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
