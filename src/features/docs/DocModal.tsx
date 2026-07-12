import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { ScrollTopButton } from '@/components/ui/ScrollTopButton';
import { SideRail } from '@/components/ui/SideRail';
import { cn } from '@/lib/cn';
import { scrollHeadingInContainer } from '@/lib/section';
import type { TocEntry } from '@/lib/toc';
import { useActiveHeadingId } from '@/lib/useScroll';
import { pausePopTransition, startRouteTransition, swallowNextPop } from '@/lib/viewTransition';
import { DocBodySkeleton } from './DocBodySkeleton';
import { formatPeriod } from './period';
import type { Doc } from '@/types/content';

interface DocModalProps {
  doc: Doc;
  /** 상세 페이지 URL의 앞부분 — '/projects' 또는 '/osc' */
  basePath: string;
  onClose: () => void;
}

/** 여닫이 트랜지션 길이(ms) — 닫을 때 이 시간만큼 기다렸다가 언마운트한다. */
const TRANSITION_MS = 260;

/** 본문 스크롤을 히스토리 항목에 적는 간격(ms) — 스크롤할 때마다 쓰면 너무 잦다. */
const SAVE_TOP_MS = 200;
/** 되돌아왔을 때 스크롤을 되돌리길 포기하는 시점(ms) — 본문이 그때까지 안 자라면 그만둔다. */
const RESTORE_TIMEOUT_MS = 1500;

/**
 * 팝업이 쌓아 둔 히스토리 항목에 적어 두는 것 — 어느 목록의 어느 문서를 열었고, 본문을 어디까지
 * 읽었는지다. 이 항목으로 되돌아오면(팝업에서 본문 링크를 눌러 상세로 갔다가 뒤로가기) 홈이 이
 * 표시를 보고 팝업을 같은 자리에 다시 연다.
 */
export interface ModalHistoryState {
  id: string;
  base: string;
  top: number;
}

/** 지금 히스토리 항목이 가리키는 팝업 — 없으면 null. */
export function readModalState(): ModalHistoryState | null {
  const state = window.history.state as { modal?: ModalHistoryState } | null;
  const modal = state?.modal;
  return modal && typeof modal.id === 'string' && typeof modal.base === 'string' ? modal : null;
}

/** 지금 히스토리 항목의 팝업 표시를 갱신한다(새로 쌓지 않는다). */
function writeModalState(next: ModalHistoryState) {
  window.history.replaceState({ ...window.history.state, modal: next }, '');
}

/**
 * 무거운 것만 lazy로 뗀다 — 팝업 껍데기는 홈 번들에 있어 클릭 즉시 뜨고, react-markdown 체인
 * (300KB대)과 상세 라우트는 필요할 때 내려받는다. 카드 호버 시 미리 받아 두기도 한다(preload).
 */
const DocBody = lazy(() => import('./DocBody'));
export const preloadDocBody = () => import('./DocBody');
/** 상세 라우트 청크 — 프로젝트와 기여가 같은 화면(DocDetailView)을 쓰지만 라우트는 각각이다. */
export const preloadDetail = (basePath: string) =>
  basePath === '/osc' ? import('./OscDetailPage') : import('./ProjectDetailPage');

/**
 * 팝업을 쓸 만한 화면인지 — 좁은 화면에서는 팝업 대신 상세 페이지로 바로 간다.
 * 폭이 좁으면 팝업이 화면을 거의 다 덮는데, 그 안에 또 스크롤 컨테이너가 생겨 중첩 스크롤이 되고
 * (본문 스크롤 vs 페이지 스크롤) 목차 rail도 어차피 숨겨져 팝업으로 얻는 게 없다.
 */
export function canUseModal(): boolean {
  return window.matchMedia('(min-width: 768px)').matches;
}

/**
 * 본문 팝업 — 카드를 누르면 그 문서(프로젝트·오픈소스 기여)의 본문만 이 안에서 읽는다.
 * 우측 목차 rail은 상세 페이지와 같은 SideRail이고, 스크롤 복원 같은 나머지 장치는
 * '확대'로 상세 페이지에 넘어갔을 때 제공한다.
 *
 * 스크롤 컨테이너는 오버레이가 아니라 패널 안쪽 본문 영역이다 — 오버레이를 스크롤시키면
 * 본문이 상단 바 위로 흘러 올라가 버린다. 상단 바를 고정 높이로 두고 본문만 스크롤시키면
 * 본문이 바를 넘어설 수 없고, 진행 바·맨 위로 버튼·목차 rail도 이 컨테이너 기준으로 계산한다.
 */
export function DocModal({ doc, basePath, onClose }: DocModalProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  /** 본문 스크롤을 히스토리에 적은 마지막 시각 — 너무 잦게 쓰지 않기 위한 스로틀 */
  const lastSaveRef = useRef(0);
  /** 스크롤이 멎은 뒤 마지막 위치를 한 번 더 적기 위한 타이머 */
  const saveTimerRef = useRef(0);
  // 마운트 다음 프레임에 켜서 등장 트랜지션(페이드 + 살짝 확대)이 발동하게 한다.
  // 닫을 때는 다시 꺼서 퇴장 트랜지션을 보인 뒤 언마운트한다.
  const [shown, setShown] = useState(false);
  // 본문은 껍데기가 화면에 그려진 다음에 마운트한다. 청크가 이미 캐시된 두 번째 열기부터는
  // lazy가 즉시 해소돼 껍데기와 거대한 마크다운이 한 커밋에 함께 렌더되고, 그 렌더가 끝날
  // 때까지 아무것도 그려지지 않아 팝업이 늦게 뜬 것처럼 보인다. 두 프레임 뒤에 붙여
  // 껍데기 + 로딩 표시가 먼저 페인트되게 한다.
  const [bodyMounted, setBodyMounted] = useState(false);
  const titleId = `doc-modal-${doc.id}`;

  // 목차는 본문 청크(DocBody)가 렌더되면서 올려 준다 — 여기서 뽑으면 슬러거가 홈 번들에 붙는다.
  const [toc, setToc] = useState<TocEntry[]>([]);
  const { activeId, select } = useActiveHeadingId(
    toc.map((entry) => entry.id),
    bodyRef,
  );

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      setShown(true);
      second = requestAnimationFrame(() => setBodyMounted(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  // 퇴장 트랜지션을 보인 뒤 언마운트한다.
  const closeNow = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, TRANSITION_MS);
  }, [onClose]);

  /**
   * 뒤로가기로 팝업을 닫을 수 있게 히스토리 항목을 하나 쌓는다 — 팝업이 열린 채로 뒤로가기를
   * 누르면 사이트를 떠나 버리는 게 아니라 팝업만 닫히고 홈에 남는다.
   *
   * react-router의 navigate가 아니라 History API를 직접 쓴다: navigate는 새 location.key를
   * 만들어 라우트 이동으로 취급되고, ScrollManager가 최상단으로 스크롤을 되돌려 버린다.
   * URL과 react-router의 state(key·idx)를 그대로 둔 채 항목만 하나 더 쌓으면, 뒤로가기 때
   * 라우트는 그대로고 popstate만 우리에게 온다. 그 popstate에는 크로스페이드를 걸지 않는다
   * (라우트가 안 바뀌므로 전환이 표식 변화를 기다리다 화면을 붙잡는다).
   */
  const pushedRef = useRef(false);
  useEffect(() => {
    // 이미 쌓았으면 다시 쌓지 않는다 — StrictMode가 개발 모드에서 effect를 두 번 돌리면
    // 항목이 두 개 쌓여 뒤로가기를 두 번 눌러야 나가게 된다(ref는 재마운트에도 유지된다).
    // 뒤로가기로 이 팝업의 항목에 되돌아온 경우에도 항목은 이미 있으므로 새로 쌓지 않는다.
    const restored = readModalState();
    const onOwnEntry = restored?.id === doc.id && restored.base === basePath;
    if (!pushedRef.current && !onOwnEntry) {
      window.history.pushState(
        { ...window.history.state, modal: { id: doc.id, base: basePath, top: 0 } },
        '',
      );
    }
    pushedRef.current = true;
    pausePopTransition(true);
    const onPop = () => {
      pushedRef.current = false; // 우리가 쌓은 항목이 이미 빠졌다
      closeNow();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      pausePopTransition(false);
    };
  }, [closeNow]);

  /**
   * 닫기·ESC·배경 클릭 — 화면은 그 자리에서 닫고, 쌓아 둔 히스토리 항목은 따로 걷어낸다.
   *
   * 예전에는 history.back()만 부르고 닫기는 popstate가 돌아오면 하도록 맡겼다. 그러면 popstate가
   * 우리 리스너에 닿지 못하는 상황(다른 리스너가 먼저 이벤트를 세우거나, 개발 서버의 HMR로 모듈이
   * 두 벌이 되는 경우)에서 배경을 눌러도 아무 일도 일어나지 않고, 두 번째 클릭의 back()이 그 앞
   * 기록으로 넘어가 버린다. 닫기를 이벤트 순서에 걸지 않으면 그런 경우가 생기지 않는다.
   *
   * back()이 뒤늦게 popstate를 몰고 오지만, 그때는 pushedRef가 이미 내려가 있어 onPop이 다시
   * 닫아도 무해하다(같은 상태를 한 번 더 쓸 뿐이다).
   */
  const requestClose = useCallback(() => {
    const hadEntry = pushedRef.current;
    pushedRef.current = false;
    closeNow();
    if (hadEntry) {
      swallowNextPop();
      window.history.back();
    }
  }, [closeNow]);

  /**
   * 읽던 위치를 히스토리 항목에 눌러 적고(스크롤 중 스로틀), 되돌아왔을 때 그 자리에서 이어 읽게
   * 한다. 언마운트 시점에 적지 않는 이유: 본문 링크로 상세에 갈 때는 새 항목이 이미 쌓인 뒤라
   * 그때 적으면 팝업의 항목이 아니라 상세의 항목에 적힌다.
   */
  const saveTop = useCallback(() => {
    const modal = readModalState();
    if (!modal || modal.id !== doc.id || modal.base !== basePath) return;
    writeModalState({ ...modal, top: bodyRef.current?.scrollTop ?? 0 });
  }, [doc.id, basePath]);

  // 본문이 붙은 뒤에 되돌린다. 한 번으로 끝나지 않는다: 마크다운은 늦게 그려지고 이미지도 뒤늦게
  // 붙으므로, 되돌린 직후에도 본문 높이가 계속 바뀐다. 문서가 짧은 동안 scrollTop을 넣으면
  // 브라우저가 값을 깎고(clamp), 나중에 위쪽 요소가 자라면 같은 좌표가 다른 지점을 가리킨다.
  // 그래서 정해진 시간 동안 목표 좌표를 계속 눌러 준다. 사용자가 스크롤·터치·키로 개입하면
  // 즉시 그만둔다 — 사용자와 스크롤을 두고 다투지 않는다.
  useEffect(() => {
    if (!bodyMounted) return;
    const modal = readModalState();
    const top = modal && modal.id === doc.id && modal.base === basePath ? modal.top : 0;
    if (top <= 0) return;

    let cancelled = false;
    const abort = () => {
      cancelled = true;
    };
    const passiveOnce = { once: true, passive: true } as const;
    const body = bodyRef.current;
    body?.addEventListener('wheel', abort, passiveOnce);
    body?.addEventListener('touchstart', abort, passiveOnce);
    window.addEventListener('keydown', abort, { once: true });

    const deadline = Date.now() + RESTORE_TIMEOUT_MS;
    let timer = 0;
    const step = () => {
      if (cancelled || !bodyRef.current) return;
      bodyRef.current.scrollTop = top;
      if (Date.now() < deadline) timer = window.setTimeout(step, 32);
    };
    step();
    return () => {
      window.clearTimeout(timer);
      body?.removeEventListener('wheel', abort);
      body?.removeEventListener('touchstart', abort);
      window.removeEventListener('keydown', abort);
    };
  }, [bodyMounted, doc.id, basePath]);

  /**
   * '확대' — 팝업이 사그라들고 상세 페이지가 떠오른다. 전환 자체는 startRouteTransition이 담당하고,
   * 여기서는 상세 라우트 청크를 먼저 받아 두기만 한다(전환 도중에 내려받으면 그만큼 늦어진다).
   */
  const expandToDetail = useCallback(async () => {
    await preloadDetail(basePath);
    startRouteTransition(() => navigate(`${basePath}/${doc.id}`));
  }, [navigate, basePath, doc.id]);

  // 열려 있는 동안 배경 스크롤 잠금 + ESC로 닫기. 잠금은 body가 아닌 html(overflowY)에 건다
  // — html에 overflow-x: clip이 있어, body에 걸면 body가 클리핑 컨테이너가 되며 sticky 헤더가
  // 문서 최상단으로 튀어 버린다(Header의 드로어 잠금과 같은 이유).
  useEffect(() => {
    const prevOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowY = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflowY = prevOverflowY;
      window.removeEventListener('keydown', onKey);
    };
  }, [requestClose]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-[#111113]/85 p-4 backdrop-blur-sm transition-opacity',
          shown ? 'opacity-100' : 'opacity-0',
        )}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        onClick={(event) => {
          // 패널 바깥(배경)을 눌렀을 때만 닫는다
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        {/* 폭은 상세 본문(max-w-3xl)과 동일 — 같은 글을 같은 줄 길이로 읽게 한다 */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cn(
            'relative flex max-h-[88vh] w-full max-w-3xl flex-col border border-divider bg-[#111113] outline-none transition-[opacity,transform,scale] ease-[cubic-bezier(0.22,1,0.36,1)]',
            shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-97 opacity-0',
          )}
          style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        >
          {/* 상단 바 — 높이가 고정된 flex 항목이라 본문이 이 위로 올라오지 못한다 */}
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-divider px-6 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-lg font-bold tracking-tight text-zinc-100">
                {doc.title}
              </h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {formatPeriod(doc.period)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={expandToDetail}
                aria-label="상세 페이지에서 보기"
                className="glow-hover inline-flex size-8 cursor-pointer items-center justify-center border border-divider text-zinc-400"
              >
                <ExpandIcon />
              </button>
              <button
                type="button"
                onClick={requestClose}
                aria-label="닫기"
                // 닫기만 로즈 — 되돌리는 동작이라 액센트(진행)와 색을 갈라 둔다
                style={{ '--glow': 'var(--color-accent-rose)' } as CSSProperties}
                className="glow-hover inline-flex size-8 cursor-pointer items-center justify-center border border-divider text-zinc-400"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* 읽기 진행 바 — 상단 바와 본문 사이. 트랙을 불투명하게 두고 두께를 키웠다:
              흰 배경 이미지가 바로 아래로 지나가면 얇고 반투명한 바는 눈에서 사라진다. */}
          <ScrollProgressBar scrollRef={bodyRef} className="h-1 shrink-0 bg-zinc-800" />

          {/* 본문 — 네이티브 스크롤바는 숨긴다(위 진행 바와 우측 rail이 위치를 알려 준다).
              pb: 맨 위로 버튼(우하단 고정)이 마지막 문단을 덮지 않도록 바닥 여백을 확보한다. */}
          <div
            ref={bodyRef}
            onScroll={(event) => {
              // 진행률은 ScrollProgressBar가 DOM을 직접 갱신한다. 여기서는 참/거짓이 뒤집힐 때만
              // 렌더를 일으켜, 스크롤 중 팝업 전체가 매 프레임 다시 렌더되지 않게 한다.
              const next = event.currentTarget.scrollTop > 240;
              setScrolled((prev) => (prev === next ? prev : next));
              // 읽던 위치는 히스토리 항목에 스로틀해 적되, 스크롤이 멎은 뒤에 한 번 더 적는다.
              // 스로틀만 두면 마지막 구간(특히 맨 아래까지 한 번에 굴린 경우)이 빠져, 되돌아왔을 때
              // 조금 위에 서게 된다.
              const now = Date.now();
              if (now - lastSaveRef.current > SAVE_TOP_MS) {
                lastSaveRef.current = now;
                saveTop();
              }
              window.clearTimeout(saveTimerRef.current);
              saveTimerRef.current = window.setTimeout(saveTop, SAVE_TOP_MS);
            }}
            // 본문 안의 무언가를 누르는 순간(내부 링크 등)의 위치를 그대로 적어 둔다 —
            // 스로틀·디바운스가 아직 안 돈 사이에 화면을 떠나면 마지막 위치가 유실된다.
            onClickCapture={saveTop}
            // overscroll은 세로만 격리한다 — overscroll-contain(양축)이면 가로 오버스크롤까지
            // 붙잡아 트랙패드 두 손가락 뒤로가기 제스처가 팝업에 먹혀 버린다.
            // 가로 스크롤은 아예 막는다(코드블록 등은 자기 안에서 스크롤한다).
            className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-6 pb-28 pt-8"
          >
            {bodyMounted ? (
              <Suspense fallback={<DocBodySkeleton />}>
                <DocBody body={doc.body} scrollRootRef={bodyRef} onToc={setToc} />
              </Suspense>
            ) : (
              <DocBodySkeleton />
            )}
          </div>

          {/* 맨 위로 — 패널 우하단. 상세 페이지와 같은 공용 버튼이다. */}
          <ScrollTopButton
            visible={scrolled}
            onClick={() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute bottom-6 right-6"
          />
        </div>
      </div>

      {/* 목차 rail — 패널 바깥(화면 우측)에 뜬다. 상세 페이지와 같은 컴포넌트·같은 위치 규칙이라
          화면이 좁아지면 똑같이 접히고 사라진다. */}
      {toc.length >= 2 && shown && (
        <SideRail
          ariaLabel="섹션 바로가기"
          items={toc.map((entry) => ({ id: entry.id, label: entry.text }))}
          activeId={activeId}
          onSelect={(id) => {
            select(id);
            // 팝업 안에는 sticky 헤더가 없으므로 .prose의 scroll-margin-top(80px)을 쓰지 않는다.
            scrollHeadingInContainer(bodyRef.current, id);
          }}
          expandedOffsetRem={28}
          className="z-50"
        />
      )}
    </>
  );
}

function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
