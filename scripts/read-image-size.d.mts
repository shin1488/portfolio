/** public/content 이미지의 실제 픽셀 치수를 { "/content/...": [width, height] }로 반환 */
export function readImageDimensions(
  publicDir: string,
  contentDir: string,
): Record<string, [number, number]>;
