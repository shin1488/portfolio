import { useMemo, useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { Frame } from "@/components/layout/Frame";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import { SITE_NAME } from "@/lib/site";
import { extractToc } from "@/lib/toc";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import { useRouteFocus } from "@/lib/useRouteFocus";
import { startRouteTransition } from "@/lib/viewTransition";
import { formatPeriod } from "./period";
import { DocLinks } from "./DocLinks";
import { HighlightText } from "./HighlightText";
import { ReadingAids } from "./ReadingAids";
import { TableOfContents } from "./TableOfContents";
import type { Doc } from "@/types/content";

interface DocDetailViewProps {
  doc: Doc;
  /** 목록 섹션의 anchor — 돌아갈 자리다('#projects', '#osc') */
  listHash: string;
  /** 이 문서가 속한 목록 — 홈에 격자가 둘이라, 어느 격자가 복귀를 맡을지 가른다 */
  basePath: string;
  /** 되돌아가기 링크에 쓸 말 */
  backLabel: string;
  /** 목록에서 이 문서가 몇 번째인지 — 복귀 시 그 칸으로 스크롤한다 */
  docIndex: number;
  /** 제목 우측에 덧붙일 것(프로젝트의 팀·개인 칩, 기여의 진행 단계 칩). 없으면 비워 둔다. */
  titleAside?: ReactNode;
  /** 기간 줄 앞에 덧붙일 것(기여의 저장소 이름). 없으면 기간만 적는다. */
  periodPrefix?: ReactNode;
}

/**
 * 문서 상세 화면 — 프로젝트와 오픈소스 기여가 같은 화면을 쓴다.
 * 차이는 돌아갈 목록과 제목 옆 칩뿐이라 props로 받고, 나머지(목차·읽기 보조·본문)는 공통이다.
 */
export function DocDetailView({
  doc,
  listHash,
  basePath,
  backLabel,
  docIndex,
  titleAside,
  periodPrefix,
}: DocDetailViewProps) {
  const navigate = useNavigate();
  useDocumentTitle(`${SITE_NAME} - ${doc.title}`);
  const headingRef = useRouteFocus();
  // 목차는 마크다운 본문에서 매번 파생 — 본문이 바뀌면 목차·미니목차·진행바가 자동 갱신된다.
  const toc = useMemo(() => extractToc(doc.body), [doc.body]);
  // 목록으로 돌아갈 때 이 문서가 놓인 칸으로 복귀시키기 위한 좌표.
  // (state는 Link가 SPA 이동에 실어 보내고, DocGrid가 마운트 시 해당 칸으로 스크롤한다)
  // basePath를 함께 싣는 이유: 홈에는 격자가 둘(기여·프로젝트)이라 인덱스만 보내면 두 격자가
  // 모두 자기 칸으로 스크롤한다. 나중에 도는 쪽이 이겨서 엉뚱한 카드에 서게 된다.
  const backState = { focusDocIndex: docIndex, focusDocBase: basePath };
  const backTo = `/${listHash}`;
  // 본문 블록을 스크롤 진입 시 하나씩 떠오르게 한다(홈의 Reveal과 같은 효과).
  const bodyRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(bodyRef, ".prose > *");

  return (
    <>
      <ReadingAids entries={toc} />

      {/* 좁은 화면에서만 프레임 세로선을 잇는다 — 헤더가 화면 끝까지 그린 선이 상세에서 끊기면
          홈과 다른 문서처럼 보인다. 넓은 화면에서는 좌우에 진행 바와 목차 rail이 이미 서 있어
          선까지 두면 번잡해지므로 그리지 않는다. */}
      <Frame className="md:border-x-0">
        {/* 읽기 화면이라 폭은 프레임(72rem)까지 넓히지 않는다 — 한 줄이 길어지면 눈이 줄을 되짚기
            어렵다. */}
        <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
          {/* 뒤로가기 줄 — 모바일에선 이 줄 맨 우측에 바로가기 링크를 둔다(제목 줄이 빽빽해지지 않게) */}
          <div className="flex items-center justify-between gap-3">
            {/* 평범한 클릭은 크로스페이드로 넘긴다. 새 탭·새 창(⌘·Ctrl·중클릭)은 Link 그대로 둔다. */}
            <Link
              to={backTo}
              state={backState}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                startRouteTransition(() =>
                  navigate(backTo, { state: backState }),
                );
              }}
              className="group inline-flex items-center text-sm font-medium"
            >
              {/* 화살표는 클립 밖 솔리드 색 — transform 이동 시 사라지지 않게. 텍스트만 breathing. */}
              <span
                aria-hidden="true"
                className="mr-1 text-accent transition-transform group-hover:-translate-x-1"
              >
                ←
              </span>
              <span className="bg-linear-to-r from-accent to-accent-end bg-clip-text text-accent transition-colors group-hover:text-transparent">
                {backLabel}
              </span>
            </Link>
            {/* 모바일(<sm)만: 바로가기 링크를 뒤로가기 줄 우측에 */}
            <div className="sm:hidden">
              <DocLinks doc={doc} />
            </div>
          </div>

          <header className="mt-6">
            <div className="flex items-start justify-between gap-3">
              {/* 제목 + 바로가기 — 데스크톱(sm+)만 제목 옆 베이스라인 정렬(모바일은 위 뒤로가기 줄에 있음) */}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-2xl font-bold tracking-tight outline-none sm:text-3xl"
                >
                  {doc.title}
                </h1>
                <div className="hidden sm:block">
                  <DocLinks doc={doc} />
                </div>
              </div>
              {titleAside}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-zinc-500 dark:text-zinc-400">
              {periodPrefix && (
                <>
                  {periodPrefix}
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{formatPeriod(doc.period)}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {doc.techStack.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
            {/* 핵심 요약(highlights) — 홈 카드를 거치지 않고 직링크로 온 독자를 위한 요약 */}
            {doc.highlights.length > 0 && (
              <ul className="mt-5 flex flex-col gap-2">
                {doc.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm leading-[1.65] text-zinc-600 dark:text-zinc-400"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.75 size-1.25 shrink-0 bg-accent"
                    />
                    <span>
                      <HighlightText text={highlight} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <div className="mt-5">
            <TableOfContents entries={toc} />
          </div>

          <div ref={bodyRef} className="mt-5 border-t border-divider pt-5">
            <Markdown>{doc.body}</Markdown>
          </div>
        </article>
      </Frame>
    </>
  );
}
