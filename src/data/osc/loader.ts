import { z } from 'zod';
import { docFrontmatterSchema, parseDocs } from '@/data/docs/parse';
import type { Contribution } from '@/types/content';

/**
 * src/content/osc/*.md를 빌드 타임에 로드해 Contribution[]로 변환한다.
 * 프로젝트와 같은 형식이되 썸네일·팀 구분이 없고, 대신 어느 저장소에 무슨 단계로 낸 기여인지를
 * 담는다 — 읽는 사람이 카드에서 가장 먼저 확인할 두 가지다.
 */
const rawFiles = import.meta.glob('/src/content/osc/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * 저장소는 소유자와 이름을 따로 받는다 — 카드 좌측 상단에 'organization/repo'로 적힌다.
 * 표기는 원문을 그대로 쓴다(대문자 포함). 이슈·PR 바로가기는 여기서 조립하지 않고 links에
 * 주소와 이름을 그대로 적는다 — 링크의 출처를 한 곳(links)으로 둔다.
 */
const SEGMENT = /^[\w.-]+$/;
const frontmatterSchema = docFrontmatterSchema.extend({
  organization: z.string().regex(SEGMENT, '슬래시 없는 한 조각이어야 합니다 (예: spring-projects)'),
  repo: z.string().regex(SEGMENT, '슬래시 없는 한 조각이어야 합니다 (예: spring-security)'),
  status: z.enum(['proposed', 'in-review', 'merged']),
});

export const contributions: Contribution[] = parseDocs(rawFiles, frontmatterSchema, '/osc');
