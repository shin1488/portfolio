/** 포트폴리오에 노출되는 모든 콘텐츠의 도메인 타입. UI는 이 계약에만 의존한다. */

export type SocialKind = 'github' | 'email' | 'blog' | 'linkedin';

export interface SocialLink {
  kind: SocialKind;
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  role: string;
  /** 히어로 영역에 노출되는 한 줄 소개 */
  tagline: string;
  /** 문단 단위 자기소개 — 평문 전용(인라인 markdown 미지원, 텍스트 노드로 렌더링됨) */
  bio: string[];
  /** 아바타 이미지가 없을 때 표시할 이니셜 */
  avatarInitials: string;
  avatarImageUrl?: string;
  location?: string;
  links: SocialLink[];
}

export interface Skill {
  name: string;
  /** 주력 기술 여부 — UI에서 강조 표시 */
  highlight?: boolean;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
}

export interface CareerItem {
  name: string;
  /** 자유 형식 기간/일자 — '2017.03 - 2023.02', '2023.06.29', '2025.12 - 현재' 등 */
  date: string;
  /** 전공, 수상 등급, 활동 요약 등 부가 설명 */
  description?: string;
}

export interface CareerCategory {
  id: string;
  title: string;
  items: CareerItem[];
}

export interface ProjectLink {
  label: string;
  href: string;
}

/**
 * markdown 한 편으로 이루어진 글 — 홈에서는 카드로, 눌렀을 때는 팝업·상세 페이지로 읽힌다.
 * 프로젝트와 오픈소스 기여가 이 골격을 공유하므로, 카드·팝업·상세 화면도 한 벌만 둔다.
 */
export interface Doc {
  /** 콘텐츠 파일명(slug) — 상세 페이지 URL에 사용 */
  id: string;
  title: string;
  /** 평문 전용(인라인 markdown 미지원) */
  summary: string;
  /** 상세 페이지에 렌더링되는 markdown 본문 */
  body: string;
  /** 홈 목록 정렬 순서(오름차순), 없으면 뒤로 밀림 */
  order?: number;
  /** 'YYYY.MM' 형식. to가 없으면 진행 중 */
  period: {
    from: string;
    to?: string;
  };
  techStack: string[];
  /** 성과·역할 중심의 bullet — 평문 전용(인라인 markdown 미지원) */
  highlights: string[];
  links: ProjectLink[];
}

export interface Project extends Doc {
  /** 팀 프로젝트 / 개인 프로젝트 구분 — 목록에서 칩으로 표시 */
  kind: 'team' | 'personal';
  /** 썸네일 이미지 경로(public 기준, 예: /content/projects/foo/thumb.png) */
  thumbnail: string;
}

/** 기여가 지금 어느 단계에 있는지 — 카드·상세의 상태 칩으로 표시한다 */
export type ContributionStatus = 'proposed' | 'in-review' | 'merged';

/** 오픈소스 기여 — 프로젝트와 달리 썸네일이 없다(이슈·PR에는 보여 줄 화면이 없다). */
export interface Contribution extends Doc {
  /** 저장소 소유자 — GitHub 주소의 첫 조각 (예: spring-projects) */
  organization: string;
  /** 저장소 이름 — GitHub 주소의 둘째 조각. 원문 표기 그대로 적는다(대문자 포함) */
  repo: string;
  /** 제안(이슈 제기) → 리뷰 중(PR 열림) → 병합 */
  status: ContributionStatus;
}
