/**
 * Vercel Image Optimization 헬퍼.
 * 원본은 /public에 그대로 두고, 배포 시 Vercel이 /_vercel/image 엔드포인트로
 * 요청 시점에 리사이즈 + webp/avif로 변환해 엣지 캐싱한다(커밋 변형본 0).
 * 로컬 dev(vite)에는 이 엔드포인트가 없으므로 원본을 그대로 반환한다.
 * 허용 width는 vercel.json images.sizes, 경로는 images.localPatterns와 일치해야 한다.
 */

/** 최적화 대상: 배포 자산 경로(/content/…)의 래스터 이미지만 (SVG는 Vercel 기본 비허용) */
function isOptimizable(src: unknown): src is string {
  return typeof src === 'string' && src.startsWith('/content/') && !src.endsWith('.svg');
}

function optimizedUrl(src: string, width: number, quality: number): string {
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

const INLINE_WIDTHS = [640, 768, 1024, 1536];

/** 본문 인라인 이미지용 srcset. dev나 최적화 비대상이면 undefined(→ 원본 src 사용). */
export function buildSrcSet(src: unknown, quality = 75): string | undefined {
  if (import.meta.env.DEV || !isOptimizable(src)) return undefined;
  return INLINE_WIDTHS.map((w) => `${optimizedUrl(src, w, quality)} ${w}w`).join(', ');
}

/** 라이트박스(확대 보기)용 고해상도 소스. dev·비대상이면 원본을 그대로 반환. */
export function highResSrc(src: string, width = 2048, quality = 80): string {
  if (import.meta.env.DEV || !isOptimizable(src)) return src;
  return optimizedUrl(src, width, quality);
}
