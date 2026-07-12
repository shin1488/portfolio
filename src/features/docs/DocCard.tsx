import { Link } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import { formatPeriod } from './period';
import { HighlightText } from './HighlightText';
import { ContributionStatusChip, RepoName } from './ContributionMeta';
import { ProjectKindChip } from './ProjectKindChip';
import { DocLinks } from './DocLinks';
import type { Contribution, Doc, Project } from '@/types/content';

/** 카드 하나에 노출하는 기술 개수 — 넘치는 만큼은 +N으로 접는다. */
const TECH_VISIBLE = 5;

interface DocCardProps {
  doc: Doc;
  /** 상세 페이지 URL의 앞부분 — '/projects' 또는 '/osc' */
  basePath: string;
  /** 격자에서 이 카드가 몇 번째인지(0부터). 발의 오른쪽 끝에 두 자리 순번으로 찍는다. */
  index: number;
  /** 등장 시차(ms) — 같은 행의 카드들을 계단식으로 띄운다. 위치와 무관하게 표시는 동일하다. */
  delay?: number;
  /** 카드를 눌렀을 때 — 넓은 화면이면 본문 팝업을 열고, 좁은 화면이면 상세 페이지로 이동한다 */
  onOpen: () => void;
  /** 마우스를 올리거나 포커스가 닿았을 때 본문 청크를 미리 받아 두는 콜백 */
  onPrefetch?: () => void;
}

/** 썸네일과 팀·개인 칩은 프로젝트에만 있다 — 이슈·PR에는 보여 줄 화면이 없다. */
function isProject(doc: Doc): doc is Project {
  return typeof (doc as Project).thumbnail === 'string';
}

/** 저장소와 진행 단계는 기여에만 있다 — 썸네일 자리를 대신해 카드 맨 위에 놓인다. */
function isContribution(doc: Doc): doc is Contribution {
  return typeof (doc as Contribution).repo === 'string';
}

/**
 * 문서 카드 — 격자의 한 칸. 프로젝트와 오픈소스 기여가 같은 칸 규격을 쓰고, 프로젝트에만 있는
 * 썸네일·구분 칩은 있을 때만 그린다. 좌/우 어느 칸에 놓이든 클래스가 완전히 같다(칸 사이
 * 세로선은 격자 쪽에서 절대 위치 선으로 그린다 — 셀에 border-r을 주면 그 칸의 콘텐츠 폭만
 * 1px 좁아져 썸네일 높이가 옆 칸과 어긋난다).
 *
 * 카드 전체가 오버레이 링크다. 평범한 클릭은 (넓은 화면에서) 본문 팝업을 열고, 새 탭·새 창
 * (⌘·Ctrl·중클릭)과 크롤러에는 상세 페이지 링크 그대로 남는다.
 */
export function DocCard({ doc, basePath, index, delay = 0, onOpen, onPrefetch }: DocCardProps) {
  const shownTech = doc.techStack.slice(0, TECH_VISIBLE);
  const hiddenCount = doc.techStack.length - shownTech.length;

  return (
    // scroll-mt: 상세에서 목록으로 복귀할 때 sticky 헤더(44px)에 카드 상단이 가리지 않게.
    <article
      id={`doc-${doc.id}`}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className="group relative scroll-mt-16"
    >
      {/* 칸 높이만큼 늘린 세로 흐름 — 발을 칸 바닥에 붙이기 위한 것이다. 본문 길이는 칸마다
          다르므로, 발을 내용 바로 밑에 두면 옆 칸과 줄이 맞지 않는다. */}
      <Reveal delay={delay} className="flex h-full flex-col">
        {/* 카드 전체를 덮는 링크는 Reveal '안'에 둔다 — 밖에 두면 눌리지 않는 링크가 생긴다.
            Reveal은 등장 연출로 translate 값을 갖는데, translate가 none이 아닌 요소는 쌓임
            맥락을 만든다. 그러면 카드 하단 줄의 z-2가 Reveal 안에 갇히고, 밖에 있는 이 오버레이의
            z-1이 Reveal 전체를 덮어 GitHub·이슈 바로가기를 가로챈다. 같은 맥락에 두면 z-2가 이긴다.
            위치 기준은 그대로 article(relative)이라 카드 전체를 덮는 것은 변하지 않는다. */}
        <Link
          to={`${basePath}/${doc.id}`}
          aria-label={`${doc.title} 본문 보기`}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onOpen();
          }}
          className="absolute inset-0 z-1"
        />
        {isProject(doc) && (
          <div className="relative aspect-16/10 overflow-hidden border-b border-divider">
            <img
              src={doc.thumbnail}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <ProjectKindChip kind={doc.kind} className="absolute left-4 top-4" />
          </div>
        )}

        <div className="flex flex-1 flex-col px-5 py-7 md:px-8 md:py-8">
          {/* 기여 카드는 썸네일이 없으므로, 그 자리에 저장소와 진행 단계를 둔다 —
              어느 저장소에 무엇이 어디까지 갔는지가 제목보다 먼저 읽혀야 한다. */}
          {isContribution(doc) && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <RepoName organization={doc.organization} repo={doc.repo} />
              <ContributionStatusChip status={doc.status} />
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4">
            {/* 호버 시 로고와 같은 그라데이션이 흐른다 — 단색 그린 대신 액센트 두 색을 모두 쓴다 */}
            <h3 className="bg-linear-to-r from-accent via-accent-end to-accent bg-size-[200%_auto] bg-clip-text text-xl font-bold tracking-tight text-zinc-100 transition-colors group-hover:animate-[logo-flow_2.5s_linear_infinite] group-hover:text-transparent">
              {doc.title}
            </h3>
            <span className="shrink-0 text-[11px] text-zinc-500">{formatPeriod(doc.period)}</span>
          </div>

          <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">{doc.summary}</p>

          {/* 기술 칩은 상세 페이지와 같은 Badge를 쓴다 — 두 화면의 칩 규격이 어긋나지 않게. */}
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {shownTech.map((tech) => (
              <li key={tech}>
                <Badge>{tech}</Badge>
              </li>
            ))}
            {hiddenCount > 0 && (
              <li className="inline-flex items-center border border-transparent px-2 py-1 text-[11px] text-zinc-600">
                +{hiddenCount}
              </li>
            )}
          </ul>

          <ul className="mt-5 flex flex-col gap-2">
            {doc.highlights.map((highlight, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-[1.65] text-zinc-400">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-accent" />
                <span>
                  <HighlightText text={highlight} />
                </span>
              </li>
            ))}
          </ul>

          {/* 카드의 발 — View Details · 바로가기 · 순번이 한 줄이다.
              mt-auto로 칸 바닥에 붙여, 본문 길이가 달라도 옆 칸과 같은 줄에 선다. */}
          <div className="relative z-2 mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-7">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
              View Details
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                ›
              </span>
            </span>
            <DocLinks doc={doc} />
            {/* 칸 순번 — 섹션 헤더의 '03 · projects/'와 같은 두 자리 규격. 줄의 마지막 항목이라
                링크가 몇 개든 오른쪽 끝에 붙는다. */}
            <span aria-hidden="true" className="ml-auto text-[11px] text-zinc-600">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
