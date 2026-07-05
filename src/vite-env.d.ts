/// <reference types="vite/client" />

declare module 'virtual:image-dimensions' {
  /** public/content 이미지의 실제 픽셀 치수 — { "/content/...": [width, height] } */
  export const imageDimensions: Record<string, [number, number]>;
}
