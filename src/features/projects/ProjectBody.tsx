import { useEffect, useRef, type RefObject } from 'react';
import { Markdown } from '@/components/ui/Markdown';
import { extractToc, type TocEntry } from '@/lib/toc';
import { useRevealOnScroll } from '@/lib/useRevealOnScroll';

interface ProjectBodyProps {
  body: string;
  /** 리빌을 판정할 스크롤 컨테이너(팝업 본문 영역) */
  scrollRootRef: RefObject<HTMLElement | null>;
  /** 추출한 목차를 팝업 껍데기로 올려 준다 — 우측 rail이 이 목차를 그린다 */
  onToc: (entries: TocEntry[]) => void;
}

/**
 * 팝업 안에서 렌더되는 마크다운 본문 — 이 파일만 lazy 청크로 떼어 낸다.
 * 팝업 껍데기(ProjectModal)는 홈 번들에 있어 클릭 즉시 열리고, 무거운 react-markdown 체인과
 * 목차 추출기(github-slugger)는 이 컴포넌트가 로드될 때 처음 내려받는다.
 * 목차를 여기서 뽑아 올리는 것도 그 때문이다 — 껍데기에서 뽑으면 슬러거가 홈 번들에 딸려 온다.
 *
 * 라우트가 아니라 Suspense 대상이라 default export를 쓴다.
 */
export default function ProjectBody({ body, scrollRootRef, onToc }: ProjectBodyProps) {
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
