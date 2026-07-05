// PNG/JPEG 바이트에서 실제 픽셀 치수를 읽는다(외부 의존성 없음).
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** PNG: IHDR의 width/height (BE, offset 16/20) */
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

/** JPEG: SOF 마커(0xC0~0xCF, C4·C8·CC 제외)의 height/width */
function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return [buf.readUInt16BE(offset + 7), buf.readUInt16BE(offset + 5)];
    }
    offset += 2 + buf.readUInt16BE(offset + 2);
  }
  return null;
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

/**
 * contentDir(예: public/content) 아래 래스터 이미지의 치수를 읽어
 * { "/content/...": [w, h] } 맵으로 반환한다. publicDir 기준으로 URL 경로를 만든다.
 */
export function readImageDimensions(publicDir, contentDir) {
  const dims = {};
  let files;
  try {
    files = walk(contentDir);
  } catch {
    return dims; // 폴더가 없으면 빈 맵
  }
  for (const file of files) {
    const ext = file.split('.').pop().toLowerCase();
    if (!['png', 'jpg', 'jpeg'].includes(ext)) continue;
    const buf = readFileSync(file);
    const size = ext === 'png' ? pngSize(buf) : jpegSize(buf);
    if (size) {
      const url = '/' + relative(publicDir, file).split('\\').join('/');
      dims[url] = size;
    }
  }
  return dims;
}
