// 콘텐츠 빌드 게이트 — loader.ts의 frontmatter 검증은 브라우저 런타임에서
// 실행되므로, 깨진 md가 빌드를 통과해 배포되는 것을 여기서 차단한다.
// Vite ssrLoadModule로 실제 loader.ts를 그대로 실행해 검증 로직을 중복하지 않는다.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'vite';

const IMAGE_REF_PATTERN = /\]\((\/content\/[^)\s]+)\)/g;

const server = await createServer({
  configFile: 'vite.config.ts',
  server: { middlewareMode: true },
  logLevel: 'error',
});

try {
  // frontmatter 파싱·zod 검증·slug 검증이 여기서 실행된다(실패 시 throw).
  const { projects } = await server.ssrLoadModule('/src/data/projects/loader.ts');

  // 본문이 참조하는 /content/ 경로가 public에 실제로 존재하고,
  // 자기 프로젝트 디렉터리(/content/projects/<id>/)를 가리키는지 검사한다.
  const errors = [];
  for (const project of projects) {
    for (const match of project.body.matchAll(IMAGE_REF_PATTERN)) {
      const ref = decodeURI(match[1]);
      if (!existsSync(join('public', ref))) {
        errors.push(`${project.id}: 존재하지 않는 파일 참조 — ${ref}`);
      } else if (!ref.startsWith(`/content/projects/${project.id}/`)) {
        errors.push(`${project.id}: 다른 프로젝트의 경로 참조(파일명 rename 후 잔재?) — ${ref}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`콘텐츠 검증 실패 (${errors.length}건):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`콘텐츠 검증 통과 — 프로젝트 ${projects.length}건`);
  }
} catch (error) {
  console.error('콘텐츠 검증 실패:');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await server.close();
}
