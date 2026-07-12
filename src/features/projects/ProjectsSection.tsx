import { lazy, Suspense, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Section } from '@/components/layout/Section';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types/content';

interface ProjectsSectionProps {
  projects: Project[];
}

// 팝업은 열 때 처음 내려받는다 — react-markdown 체인이 홈 초기 번들에 들어가지 않게.
const ProjectModal = lazy(() => import('./ProjectModal'));

/**
 * Projects — 프레임 안 2열 격자. 여섯 칸 모두 ProjectCard 하나로 렌더하고, 칸 사이 여백·라운드
 * 없이 hairline만 둬 카드가 아니라 도면의 칸처럼 붙는다. 칸을 누르면 본문 팝업이 열린다.
 */
export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const n = projects.length;

  // 상세 페이지에서 "목록으로"를 눌러 돌아왔을 때 보고 있던 프로젝트 카드로 복귀시킨다.
  const restoreRaw = (location.state as { focusProjectIndex?: number } | null)?.focusProjectIndex;
  const restoreIdx =
    typeof restoreRaw === 'number' && n > 0 ? Math.min(Math.max(restoreRaw, 0), n - 1) : null;

  // 페인트 전(useLayoutEffect)에 스크롤해 상단이 한 프레임 비치는 것을 막는다.
  // (ScrollManager는 이 state가 있으면 앵커 스크롤을 양보한다)
  useLayoutEffect(() => {
    if (restoreIdx === null) return;
    document
      .getElementById(`project-${projects[restoreIdx].id}`)
      ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    // location.key마다 1회만 — 이후 사용자의 스크롤은 건드리지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  if (!n) return null;

  const openProject = projects.find((project) => project.id === openId) ?? null;

  return (
    <Section id="projects" index="02" slug="projects" title="Projects" glow="rose" glowSide="left">
      {/* 세로 divider를 셀의 border-r로 그리지 않는다 — border-box에서는 우측 테두리가 그 셀의
          콘텐츠 폭을 1px 깎는다. 그러면 aspect-16/10 썸네일의 높이가 옆 칸과 0.6px 어긋나고,
          그 아래 제목·기간·본문이 통째로 밀려 두 칸의 줄이 맞지 않는다. 선을 절대 위치로 빼면
          두 칸의 폭이 정확히 같아지고, 여섯 칸이 완전히 동일한 컴포넌트·클래스로 렌더된다.
          격자 밖 래퍼에 두어 셀의 nth-child 계산도 건드리지 않는다. */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-divider md:block"
        />
        {/* 첫 행(md는 두 칸)만 위 선을 지운다 — 섹션 헤더의 아래 선과 겹치지 않게. */}
        <div className="grid [&>*:first-child]:border-t-0 [&>*]:border-t [&>*]:border-divider md:grid-cols-2 md:[&>*:nth-child(2)]:border-t-0">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              delay={(i % 2) * 50}
              onOpen={() => setOpenId(project.id)}
            />
          ))}
        </div>
      </div>

      {openProject && (
        <Suspense fallback={null}>
          <ProjectModal project={openProject} onClose={() => setOpenId(null)} />
        </Suspense>
      )}
    </Section>
  );
}
