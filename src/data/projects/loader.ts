import { load as parseYaml } from 'js-yaml';
import { z } from 'zod';
import type { Project } from '@/types/content';

/**
 * src/content/projects/*.md를 빌드 타임에 로드해 Project[]로 변환한다.
 * 파일명(확장자 제외)이 id가 되고, frontmatter는 스키마로 검증되므로
 * 형식이 틀린 파일은 페이지 로드 즉시(개발 중) 에러로 드러난다.
 */
const rawFiles = import.meta.glob('/src/content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const PERIOD_PATTERN = /^\d{4}\.(0[1-9]|1[0-2])$/;

const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  period: z.object({
    from: z.string().regex(PERIOD_PATTERN, "'YYYY.MM' 형식이어야 합니다"),
    to: z.string().regex(PERIOD_PATTERN, "'YYYY.MM' 형식이어야 합니다").optional(),
  }),
  techStack: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)),
  links: z
    .array(z.object({ label: z.string().min(1), href: z.url() }))
    .default([]),
  kind: z.enum(['team', 'personal']),
  thumbnail: z.string().min(1),
  order: z.number().int().optional(),
});

// 닫는 펜스는 줄 전체가 '---'(+수평 공백)일 것을 요구한다 —
// frontmatter 값 안의 '----'나 '--- 메모' 줄에서 조기 종료되지 않도록.
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*(?:\r?\n|$)/;

// 파일명이 곧 /projects/:id URL이 되므로 소문자 slug만 허용한다.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function parseProjectFile(path: string, raw: string): Project {
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

  const parsed = frontmatterSchema.safeParse(meta);
  if (!parsed.success) {
    throw new Error(`${path}: frontmatter 검증 실패\n${z.prettifyError(parsed.error)}`);
  }

  const id = path.split('/').pop()!.replace(/\.md$/, '');
  if (!SLUG_PATTERN.test(id)) {
    throw new Error(
      `${path}: 파일명(확장자 제외)은 소문자 slug(a-z, 0-9, '-')여야 합니다 — /projects/${id} URL에 그대로 쓰입니다`,
    );
  }
  return { id, body: raw.slice(match[0].length).trim(), ...parsed.data };
}

export const projects: Project[] = Object.entries(rawFiles)
  .map(([path, raw]) => parseProjectFile(path, raw))
  .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
