import { load as parseYaml } from 'js-yaml';
import { z } from 'zod';

/**
 * markdown 콘텐츠 파일(frontmatter + 본문)을 읽어 객체로 만드는 공통 절차.
 * 프로젝트와 오픈소스 기여가 같은 형식을 쓰므로, 파싱·검증·정렬을 한 곳에 둔다.
 * 차이는 frontmatter 스키마와 URL 앞부분(/projects, /osc)뿐이라 인자로 받는다.
 */

const PERIOD_PATTERN = /^\d{4}\.(0[1-9]|1[0-2])$/;

/** 정렬에 쓰는 최소 계약 — 스키마가 무엇을 더 담든 order는 있어야 한다(없으면 뒤로 밀린다). */
interface DocMeta {
  order?: number;
}

/** 프로젝트·기여가 함께 쓰는 frontmatter 필드 */
export const docFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  period: z.object({
    from: z.string().regex(PERIOD_PATTERN, "'YYYY.MM' 형식이어야 합니다"),
    to: z.string().regex(PERIOD_PATTERN, "'YYYY.MM' 형식이어야 합니다").optional(),
  }),
  techStack: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)),
  links: z.array(z.object({ label: z.string().min(1), href: z.url() })).default([]),
  order: z.number().int().optional(),
});

// 닫는 펜스는 줄 전체가 '---'(+수평 공백)일 것을 요구한다 —
// frontmatter 값 안의 '----'나 '--- 메모' 줄에서 조기 종료되지 않도록.
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*(?:\r?\n|$)/;

// 파일명이 곧 URL의 마지막 조각이 되므로 소문자 slug만 허용한다.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * 파일 한 편을 파싱한다. 형식이 틀리면 즉시 던져, 깨진 콘텐츠가 배포로 흘러가지 않게 한다
 * (빌드 앞단의 콘텐츠 검증 스크립트가 이 예외를 게이트로 쓴다).
 */
function parseDocFile<Out extends DocMeta>(
  path: string,
  raw: string,
  schema: z.ZodType<Out>,
  urlBase: string,
): Out & { id: string; body: string } {
  const match = FRONTMATTER_PATTERN.exec(raw);
  if (!match) {
    throw new Error(`${path}: frontmatter 블록(---)이 없습니다`);
  }

  let meta: unknown;
  try {
    meta = parseYaml(match[1]);
  } catch (error) {
    throw new Error(
      `${path}: frontmatter YAML 파싱 실패 — ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const parsed = schema.safeParse(meta);
  if (!parsed.success) {
    throw new Error(`${path}: frontmatter 검증 실패\n${z.prettifyError(parsed.error)}`);
  }

  const id = path.split('/').pop()!.replace(/\.md$/, '');
  if (!SLUG_PATTERN.test(id)) {
    throw new Error(
      `${path}: 파일명(확장자 제외)은 소문자 slug(a-z, 0-9, '-')여야 합니다 — ${urlBase}/${id} URL에 그대로 쓰입니다`,
    );
  }
  return { id, body: raw.slice(match[0].length).trim(), ...parsed.data };
}

/** 파일 묶음을 파싱해 order 오름차순으로 정렬한다(order가 없으면 뒤로 밀린다). */
export function parseDocs<Out extends DocMeta>(
  rawFiles: Record<string, string>,
  schema: z.ZodType<Out>,
  urlBase: string,
): (Out & { id: string; body: string })[] {
  return Object.entries(rawFiles)
    .map(([path, raw]) => parseDocFile(path, raw, schema, urlBase))
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
}
