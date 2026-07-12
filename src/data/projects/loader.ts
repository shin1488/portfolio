import { z } from 'zod';
import { docFrontmatterSchema, parseDocs } from '@/data/docs/parse';
import type { Project } from '@/types/content';

/**
 * src/content/projects/*.md를 빌드 타임에 로드해 Project[]로 변환한다.
 * 파일명(확장자 제외)이 id가 되고, frontmatter는 스키마로 검증되므로
 * 형식이 틀린 파일은 페이지 로드 즉시(개발 중) 에러로 드러난다.
 * 파싱·검증·정렬 절차는 오픈소스 기여와 같아서 data/docs/parse.ts에 함께 둔다.
 */
const rawFiles = import.meta.glob('/src/content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** 프로젝트에만 있는 필드 — 팀·개인 구분과 카드 썸네일 */
const frontmatterSchema = docFrontmatterSchema.extend({
  kind: z.enum(['team', 'personal']),
  thumbnail: z.string().min(1),
});

export const projects: Project[] = parseDocs(rawFiles, frontmatterSchema, '/projects');
