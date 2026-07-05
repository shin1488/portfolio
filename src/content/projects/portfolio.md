---
title: 포트폴리오 사이트
summary: 지금 보고 계신 사이트. 백엔드·DB 없이 저장소의 markdown 파일을 데이터 소스로 쓰는 정적 사이트입니다.
period:
  from: "2026.07"
techStack: [React 19, TypeScript, Vite, Tailwind CSS, react-router]
highlights:
  - '백엔드 없이 저장소 커밋만으로 콘텐츠를 관리하는 구조 설계 — 인증은 GitHub 계정, 배포는 push 자동'
  - 'frontmatter zod 검증 + 빌드 게이트로 깨진 콘텐츠의 배포 차단'
links:
  - label: GitHub
    href: https://github.com/shin1488
kind: personal
thumbnail: /content/projects/portfolio/thumbnail.svg
order: 7
---

## 개요

프로젝트를 markdown 파일 하나로 관리하는 구조입니다.
`src/content/projects/`에 md 파일을 추가하면 홈 카드와 상세 페이지가 함께 생깁니다.

원래 Supabase에 콘텐츠를 두었지만, 무료 티어의 비활성 일시정지와 편집 불편 때문에
"저장소 안 파일 = 데이터" 구조로 전환했습니다. 인증 문제는 GitHub 계정이 해결하고,
push하면 Vercel이 자동으로 재배포합니다.

## 콘텐츠 구조

- frontmatter — 카드에 노출되는 메타데이터(제목, 기간, 기술, 링크). zod 스키마로 검증
- 본문 — 상세 페이지에 렌더링되는 markdown (react-markdown + GFM)
- 이미지 — `public/content/projects/<id>/`에 함께 커밋

## 신경 쓴 부분

- frontmatter 검증이 브라우저 런타임에만 있으면 깨진 md가 그대로 배포되므로,
  빌드 앞단에 콘텐츠 검증 스크립트(vite ssrLoadModule)를 게이트로 배선
- 뒤로가기 스크롤 복원, 라우트 전환 시 h1 포커스 이동 등 SPA 접근성 처리
- 상세 페이지 라우트 단위 code-split으로 markdown 렌더러를 홈 번들에서 분리
