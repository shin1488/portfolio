import type { CareerCategory, Profile, Project, SkillCategory } from '@/types/content';
import { careers } from './mock/careers';
import { profile } from './mock/profile';
import { projects } from './projects/loader';
import { skillCategories } from './mock/skills';

/**
 * 콘텐츠 소스의 단일 진입점.
 * UI는 이 모듈만 import하므로, mock을 markdown 로더나 CMS 응답으로
 * 교체할 때 이 파일만 수정하면 된다.
 * 단, 본문 필드(bio/summary/highlights)는 평문 계약이라 인라인 서식이
 * 필요해지면 types/content.ts 계약과 UI 렌더러를 함께 확장해야 한다.
 */
export interface ContentSource {
  profile: Profile;
  skillCategories: SkillCategory[];
  projects: Project[];
  careers: CareerCategory[];
}

export const content: ContentSource = {
  profile,
  skillCategories,
  projects,
  careers,
};
