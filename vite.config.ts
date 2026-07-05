import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { readImageDimensions } from './scripts/read-image-size.mjs';

/**
 * public/content 이미지의 실제 픽셀 치수를 가상 모듈로 노출한다.
 * 마크다운 렌더러가 이 값으로 <img>에 width/height를 박아 종횡비 공간을 미리 예약
 * → lazy 로드로 문서 높이가 변해 스크롤 진행바가 튀는 문제 방지.
 * 커밋 산출물·별도 스크립트 없이 번들이 처리하고, dev에선 이미지 추가 시 자동 반영된다.
 */
function imageDimensions(): Plugin {
  const VIRTUAL_ID = 'virtual:image-dimensions';
  const RESOLVED_ID = '\0' + VIRTUAL_ID;
  const publicDir = fileURLToPath(new URL('./public', import.meta.url));
  const contentDir = fileURLToPath(new URL('./public/content', import.meta.url));

  return {
    name: 'image-dimensions',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const dims = readImageDimensions(publicDir, contentDir);
      return `export const imageDimensions = ${JSON.stringify(dims)};`;
    },
    configureServer(server) {
      // dev: content 이미지가 추가·교체·삭제되면 가상 모듈을 무효화해 자동 갱신
      const isContentImage = (file: string) =>
        file.replaceAll('\\', '/').includes('/public/content/') &&
        /\.(png|jpe?g)$/i.test(file);
      const invalidate = (file: string) => {
        if (!isContentImage(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.add(contentDir);
      server.watcher.on('add', invalidate);
      server.watcher.on('unlink', invalidate);
      server.watcher.on('change', invalidate);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), imageDimensions()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
