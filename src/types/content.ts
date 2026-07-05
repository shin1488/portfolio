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

export interface Project {
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
  /** 팀 프로젝트 / 개인 프로젝트 구분 — 목록에서 칩으로 표시 */
  kind: 'team' | 'personal';
  /** 썸네일 이미지 경로(public 기준, 예: /content/projects/foo/thumb.png) */
  thumbnail: string;
}
