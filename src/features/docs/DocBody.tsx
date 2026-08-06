import { memo, useEffect, useRef, type RefObject } from 'react';
import { Markdown } from '@/components/ui/Markdown';
import { extractToc, type TocEntry } from '@/lib/toc';
import { useRevealOnScroll } from '@/lib/useRevealOnScroll';

interface DocBodyProps {
  body: string;
  /** 리빌을 판정할 스크롤 컨테이너(팝업 본문 영역) */
  scrollRootRef: RefObject<HTMLElement | null>;
  /** 추출한 목차를 팝업 껍데기로 올려 준다 — 우측 rail이 이 목차를 그린다 */
  onToc: (entries: TocEntry[]) => void;
}

/**
 * 팝업 안에서 렌더되는 마크다운 본문 — 이 파일만 lazy 청크로 떼어 낸다.
 * 팝업 껍데기(DocModal)는 홈 번들에 있어 클릭 즉시 열리고, 무거운 react-markdown 체인과
 * 목차 추출기(github-slugger)는 이 컴포넌트가 로드될 때 처음 내려받는다.
 * 목차를 여기서 뽑아 올리는 것도 그 때문이다 — 껍데기에서 뽑으면 슬러거가 홈 번들에 딸려 온다.
 *
 * 라우트가 아니라 Suspense 대상이라 default export를 쓴다.
 *
 * memo로 감싸는 이유: 팝업은 목차 강조와 '맨 위로' 노출 상태를 자기 안에 들고 있어 스크롤 중에
 * 여러 번 다시 렌더된다. 그때마다 이 본문까지 함께 렌더되면 수만 자 마크다운을 매번 다시 파싱하고
 * 수천 개 노드를 대조하게 되어 그 프레임이 통째로 밀린다(같은 글을 문서 스크롤로 읽는 상세
 * 페이지는 그 상태가 형제 컴포넌트에 있어 본문이 다시 렌더되지 않는다 — 실측: 상세 0건 대 팝업 22건).
 * 세 prop이 모두 값이 변하지 않는 것들이라(본문 문자열·ref 객체·setState 함수) 이 벽으로 충분하다.
 */
function DocBody({ body, scrollRootRef, onToc }: DocBodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  useRevealOnScroll(ref, '.prose > *', scrollRootRef);

  useEffect(() => {
    onToc(extractToc(body));
  }, [body, onToc]);

  return (
    <div ref={ref}>
      <Markdown>{body}</Markdown>
    </div>
  );
}

export default memo(DocBody);
