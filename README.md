# Portfolio

React + TypeScript + Vite + Tailwind CSS로 만든 정적 포트폴리오 사이트.
콘텐츠는 저장소 안 파일이 전부이며 백엔드·DB 없이 동작합니다.

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 타입체크 + 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
```

## 구조

```
src/
  app/          앱 조립(App, 라우팅), 페이지(HomePage), ScrollManager
  components/
    layout/     Header, Footer, Section, NotFoundView 등 페이지 골격
    ui/         Badge, Card, Markdown 등 재사용 프리미티브
  features/     도메인 섹션 (profile / skills / projects / careers)
  content/
    projects/   프로젝트 markdown 파일 (frontmatter + 본문)
  data/         콘텐츠 소스의 단일 진입점
    mock/       프로필·기술 스택·이력(careers) 데이터
    projects/   md 파일 로더 (frontmatter 파싱 + zod 검증)
  types/        콘텐츠 도메인 타입 (UI가 의존하는 계약)
  lib/          유틸(cn, useDocumentTitle), 네비게이션 정의(nav)
public/
  content/
    projects/<id>/   프로젝트 본문에서 참조하는 이미지
```

## 프로젝트 추가하기

1. `src/content/projects/<id>.md` 파일을 만듭니다. 파일명이 곧 상세 페이지
   주소(`/projects/<id>`)가 됩니다.
2. frontmatter에 메타데이터(title, summary, period, techStack, highlights,
   links, featured, order)를 적습니다. 형식이 틀리면 개발 서버에서 즉시
   검증 에러가 표시됩니다.
3. 본문 markdown을 작성합니다. GFM(표, 체크리스트 등)을 지원합니다.
4. 이미지는 `public/content/projects/<id>/`에 넣고 본문에서
   `![설명](/content/projects/<id>/파일명.png)` 절대경로로 참조합니다.

frontmatter의 summary·highlights는 카드에 평문으로 노출됩니다(인라인
markdown 미지원). 본문은 상세 페이지에서 markdown으로 렌더링됩니다.

## 콘텐츠 소유권

- 프로필·기술 스택·이력(Careers): `src/data/mock/`
- 프로젝트: `src/content/projects/*.md`
- 섹션 제목·설명, 헤더 내비게이션 라벨, 브라우저 탭 기본 제목(`index.html`):
  UI 크롬으로 보고 코드(`src/features/*Section.tsx`, `src/lib/nav.ts`)가
  소유합니다. 이 문구 변경은 코드 수정입니다.

## 배포

Vercel 정적 배포 기준이며, SPA 라우팅을 위한 rewrite가 `vercel.json`에
정의되어 있습니다(모든 경로 → `index.html`, 정적 파일이 우선).
