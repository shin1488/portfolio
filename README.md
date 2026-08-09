# Shin's Portfolio

**https://shin-portfolio-gracias.vercel.app**

백엔드 없이 저장소 안 markdown 파일만으로 동작하는 정적 포트폴리오.

## 기술

| | |
|---|---|
| Core | React 19 · TypeScript 7 · Vite 8 |
| Routing | React Router 8 (declarative) |
| Styling | Tailwind CSS 4 · `@tailwindcss/typography` |
| Content | markdown + frontmatter · js-yaml · zod (스키마 검증) |
| Rendering | react-markdown · remark-gfm · rehype-highlight · rehype-slug · react-pdf |
| Quality | ESLint · `eslint-plugin-boundaries` (계층 의존 강제) |
| Deploy | Vercel (정적 · SPA rewrite) · Vercel Analytics |

TypeScript는 7.0과 6.0을 나란히 둡니다. 7.0은 아직 프로그래밍 API를 내놓지 않아
typescript-eslint가 6.0 API를 필요로 하기 때문입니다. 타입체크와 빌드의 `tsc`는
`@typescript/native`(7.0)가, lint가 쓰는 `typescript` 모듈은 `@typescript/typescript6`가
맡습니다.

## 구조

Feature-Sliced Design을 이 규모에 맞게 줄여 적용했습니다. 레이어는 여덟이고, 의존 방향은
ESLint가 강제합니다(`boundaries/dependencies`, 기본값 `disallow`).

```
src/
  app/                라우팅 · HomePage · 스크롤 복원
  features/           도메인 슬라이스 — profile · skills · docs · careers
  components/layout/  Header · Footer · Section · Frame
  components/ui/      Badge · Markdown · SideRail 등 프리미티브
  data/               md 로더(frontmatter 파싱 + zod 검증) · 정적 데이터
  content/            프로젝트 · 오픈소스 기여 markdown
  lib/                유틸 · 네비게이션 정의 · 스크롤/전환 훅
  types/              콘텐츠 도메인 타입
```

의존 규칙은 두 가지입니다.

- **위에서 아래로만** — `app → feature → layout → ui → lib → types` 순으로만 참조합니다.
  `data`는 `content`·`lib`·`types`까지, `ui`는 `lib`·`types`까지만 닿습니다.
- **슬라이스는 서로 모른다** — feature끼리의 수입은 금지입니다. 두 feature가 같은 것을
  필요로 하면 아래 레이어로 내리거나 한 슬라이스로 합칩니다. 프로젝트와 오픈소스 기여가
  `features/docs` 하나로 합쳐진 것이 이 규칙을 따른 결과입니다.
