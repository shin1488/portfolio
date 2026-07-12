import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { startRouteTransition } from '@/lib/viewTransition';
import { DocCard } from './DocCard';
import { canUseModal, DocModal, preloadDocBody, preloadDetail } from './DocModal';
import type { Doc } from '@/types/content';

interface DocGridProps {
  docs: Doc[];
  /** 상세 페이지 URL의 앞부분 — '/projects' 또는 '/osc' */
  basePath: string;
  /** 팝업 열림 여부 — 홈이 섹션 rail을 접을지 판단한다(팝업이 자기 목차 rail을 띄우므로). */
  onModalOpenChange?: (open: boolean) => void;
}

/**
 * 문서 카드 격자 — 칸 사이 여백·라운드 없이 hairline만 둬 카드가 아니라 도면의 칸처럼 붙는다.
 * 프로젝트와 오픈소스 기여가 같은 격자·같은 카드·같은 팝업을 쓴다(차이는 썸네일 유무뿐이다).
 * 칸을 누르면 본문 팝업이 열리고, 좁은 화면에서는 상세 페이지로 바로 넘어간다.
 */
export function DocGrid({ docs, basePath, onModalOpenChange }: DocGridProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const n = docs.length;

  // 좁은 화면(모바일)에서는 팝업을 띄우지 않고 상세 페이지로 바로 넘어간다 — 팝업이 화면을 거의
  // 다 덮는데 그 안에 스크롤 컨테이너가 또 생겨 중첩 스크롤이 되고, 목차 rail도 숨겨져 이득이 없다.
  const open = (id: string) => {
    if (canUseModal()) {
      setOpenId(id);
      return;
    }
    startRouteTransition(() => navigate(`${basePath}/${id}`));
  };
  // 마우스를 올리거나 포커스가 닿으면 곧 필요해질 청크를 미리 받아 둔다(화면 폭에 따라 대상이 다르다).
  const prefetch = () => {
    void (canUseModal() ? preloadDocBody() : preloadDetail(basePath));
  };

  useEffect(() => {
    onModalOpenChange?.(openId !== null);
  }, [openId, onModalOpenChange]);

  // 상세 페이지에서 "목록으로"를 눌러 돌아왔을 때 보고 있던 카드로 복귀시킨다.
  // 자기 목록에서 온 것일 때만 — 홈에는 격자가 둘이라, 확인하지 않으면 둘 다 스크롤해 버린다.
  const restoreState = location.state as {
    focusDocIndex?: number;
    focusDocBase?: string;
  } | null;
  const restoreRaw =
    restoreState?.focusDocBase === basePath ? restoreState.focusDocIndex : undefined;
  const restoreIdx =
    typeof restoreRaw === 'number' && n > 0 ? Math.min(Math.max(restoreRaw, 0), n - 1) : null;

  // 페인트 전(useLayoutEffect)에 스크롤해 상단이 한 프레임 비치는 것을 막는다.
  // (ScrollManager는 이 state가 있으면 앵커 스크롤을 양보한다)
  useLayoutEffect(() => {
    if (restoreIdx === null) return;
    document
      .getElementById(`doc-${docs[restoreIdx].id}`)
      ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    // location.key마다 1회만 — 이후 사용자의 스크롤은 건드리지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  if (!n) return null;

  const openDoc = docs.find((doc) => doc.id === openId) ?? null;

  return (
    <>
      {/* 세로 divider를 셀의 border-r로 그리지 않는다 — border-box에서는 우측 테두리가 그 셀의
          콘텐츠 폭을 1px 깎는다. 그러면 aspect-16/10 썸네일의 높이가 옆 칸과 0.6px 어긋나고,
          그 아래 제목·기간·본문이 통째로 밀려 두 칸의 줄이 맞지 않는다. 선을 절대 위치로 빼면
          두 칸의 폭이 정확히 같아지고, 칸들이 완전히 동일한 컴포넌트·클래스로 렌더된다.
          격자 밖 래퍼에 두어 셀의 nth-child 계산도 건드리지 않는다. */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-divider md:block"
        />
        {/* 첫 행(md는 두 칸)만 위 선을 지운다 — 섹션 헤더의 아래 선과 겹치지 않게. */}
        <div className="grid [&>*:first-child]:border-t-0 [&>*]:border-t [&>*]:border-divider md:grid-cols-2 md:[&>*:nth-child(2)]:border-t-0">
          {docs.map((doc, i) => (
            <DocCard
              key={doc.id}
              doc={doc}
              basePath={basePath}
              index={i}
              delay={(i % 2) * 90}
              onOpen={() => open(doc.id)}
              onPrefetch={prefetch}
            />
          ))}
        </div>
      </div>

      {openDoc && (
        <DocModal doc={openDoc} basePath={basePath} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
