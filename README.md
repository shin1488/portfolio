# Shin's Portfolio

**https://shin-portfolio-gracias.vercel.app**

백엔드 없이 저장소 안 markdown 파일만으로 동작하는 정적 포트폴리오입니다.

## 기술

| 구분 | 사용 기술 |
|---|---|
| Core | React 19 · TypeScript 7 · Vite 8 |
| Routing | React Router 8 (declarative) |
| Styling | Tailwind CSS 4 · `@tailwindcss/typography` |
| Content | markdown + frontmatter · js-yaml · zod |
| Rendering | react-markdown · remark-gfm · rehype-highlight · rehype-slug · react-pdf |
| Quality | ESLint · `eslint-plugin-boundaries` |
| Deploy | Vercel · Vercel Analytics |

## 구조

Feature-Sliced Design을 이 규모에 맞게 줄여 적용했습니다. 레이어는 여덟이며, 의존 방향은
ESLint(`boundaries/dependencies`)가 강제합니다.

```
src/
  app/                라우팅 · HomePage · 스크롤 복원
  features/           도메인 슬라이스(profile · skills · docs · careers)
  components/layout/  Header · Footer · Section · Frame
  components/ui/      Badge · Markdown · SideRail 등 프리미티브
  data/               markdown 로더(frontmatter 파싱 · zod 검증) · 정적 데이터
  content/            프로젝트 · 오픈소스 기여 markdown
  lib/                유틸 · 네비게이션 정의 · 스크롤 훅
  types/              콘텐츠 도메인 타입
```

의존 규칙은 둘입니다.

- **단방향 참조** — `app → feature → layout → ui → lib → types` 순으로만 참조합니다.
  `data`는 `content` · `lib` · `types`를, `ui`는 `lib` · `types`를 참조합니다.
- **슬라이스 독립** — feature끼리는 서로 import하지 않습니다. 두 feature가 같은 모듈을 필요로 하면
  아래 레이어로 옮기거나 한 슬라이스로 합칩니다.
