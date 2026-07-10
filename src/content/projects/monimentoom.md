---
title: 모니멘툼 (Monimentoom)
summary: >-
  좋아하는 굿즈를 나만의 픽셀 아트 방에 전시하고, 다른 사람의 방을 오가며 댓글·좋아요로 소통하는
  온라인 굿즈 전시 사이트. 3인 팀에서 프론트엔드 전반을 단독으로 맡아 기획부터 구현·배포까지 진행했습니다.
period:
  from: "2026.03"
  to: "2026.03"
techStack: [React 19, TypeScript, Vite, Tailwind CSS 4, Redux Toolkit, TanStack Query, Framer Motion, AWS S3]
highlights:
  - '성과 — 웹 어플리케이션 개발 프로젝트 우수상'
  - '선반 편집 UX — 굿즈를 4×4 그리드에 배치, 데스크톱 마우스와 모바일 터치를 한 인터랙션으로 통합'
  - '지연 반영 — 편집은 로컬(Redux)에서 즉시, 저장 시점에만 서버와 위치 diff 동기화'
  - '역할 — 3인 팀 프론트엔드 단독 담당, 전 페이지·상태 관리·S3/카카오 연동·Vercel 배포'
links:
  - label: GitHub
    href: https://github.com/AES-2nd-Project
kind: team
thumbnail: /content/projects/monimentoom/home.png
order: 3
---

# 프로젝트 소개

---

![모니멘툼](/content/projects/monimentoom/logo.png)

## 모니멘툼(Monimentoom)이란?

- 현대오토에버 모빌리티SW스쿨 웹/앱 3기 2차 프로젝트로, 3인 팀이 기획부터 구현·배포까지 진행했습니다.
- 라틴어 **Monumentum(기념물)** 에 방을 뜻하는 *-toom* 을 붙여 어감을 귀엽게 비튼 이름입니다. 아껴서 쓰지는 못하고 모셔만 두는 굿즈를 "온라인에 전시하는 기념물"로 만들자는 아이디어에서 출발했습니다.
- 사용자가 자신만의 **픽셀 아트 '방'** 에 좋아하는 굿즈를 전시하고, 다른 사람의 방을 방문해 댓글·좋아요로 소통하는 온라인 굿즈 전시 사이트입니다.
- 굿즈 사진을 인벤토리에 올려 선반에 자유롭게 배치하고, 랜덤 또는 닉네임으로 다른 사용자의 방을 방문하며, QR 코드로 자신의 방을 외부에 공유합니다.

![모니멘툼 홈 — 픽셀 아트 방과 굿즈 쇼케이스](/content/projects/monimentoom/home.png)

## 담당 역할

3인 팀(백엔드 2 · 프론트엔드 1)에서 **프론트엔드 전반을 단독으로 담당**했습니다. 기획 참여부터 전 페이지 구현, 핵심 인터랙션, 상태 관리 레이어, 외부 서비스 연동, 배포까지 맡았습니다.

- **페이지·인터랙션** — Home · Room · MyPage · Signup · KakaoCallback 전 페이지, 인벤토리↔선반 드래그 앤 드롭, 굿즈 디테일 오버레이. 데스크톱(마우스)과 모바일(터치) 양쪽 입력을 대응했습니다.
- **상태·통신** — 편집·세션 상태와 서버 통신의 계층 분리 설계, 토큰 자동 재발급과 401 처리 구현.
- **연동·배포** — S3 프리사인드 업로드, QR 공유, 카카오 OAuth 연동, 배포 · 환경 변수 · 도메인 설정.


# 주요 기능

---

## 굿즈 등록

굿즈 사진을 인벤토리에 업로드하고 이름·설명과 함께 관리합니다. GIF를 포함한 여러 이미지 형식을 지원하며, 업로드는 S3 프리사인드 URL로 처리됩니다.

## 선반 전시

4×4 그리드 선반에서 원하는 영역을 드래그해 지정하고, 인벤토리의 굿즈를 그 크기대로 얹습니다. 데스크톱에서는 드래그 앤 드롭으로, 모바일에서는 탭으로 배치합니다.

## 방 꾸미기

선반 밖 공간은 액자와 이젤로 꾸밉니다. 원하는 이미지를 끼워 자신만의 전시 방을 구성합니다.

## 방 방문 · 소통

랜덤 또는 닉네임 검색으로 다른 사용자의 방을 방문하고, 댓글과 좋아요를 남깁니다. 댓글의 프로필을 누르면 그 사용자의 방으로 이동합니다.

## 공유 · 계정

QR 코드로 내 방을 외부에 공유하고, 카카오 OAuth로 로그인합니다.


# 사용된 기술

---

- **Frontend** — React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · React Router 7
- **상태·통신** — Redux Toolkit(편집·세션 상태) · TanStack Query(인증 뮤테이션) · Axios 공용 인스턴스(토큰 재발급 인터셉터) · Framer Motion
- **외부 연동** — AWS S3(프리사인드 PUT 업로드) · 카카오 OAuth · QR 공유
- **배포** — Vercel
- **Backend(팀)** — Spring · Java · MySQL · Nginx · AWS EC2 · GitLab CI/CD

서버 상태는 공용 Axios 인스턴스로, 인증 흐름은 TanStack Query 뮤테이션으로, 편집·세션 같은 클라이언트 상태는 Redux Toolkit으로 나눠 데이터가 어디서 흐르고 어디에 머무는지를 계층으로 분리했습니다.


# 시스템 아키텍처

---

![전체 아키텍처 — Vercel 프론트, EC2 blue-green 백엔드, S3](/content/projects/monimentoom/slide-architecture.png)

프론트엔드는 Vercel에 배포된 React SPA이고, 백엔드는 AWS EC2의 Docker 환경에서 동작합니다. 모든 요청은 Nginx에서 HTTPS로 종료된 뒤 blue-green 중 활성(active) 서버로 라우팅되고, 데이터는 MySQL로 · 파일은 S3로 분리해 처리합니다. 이미지처럼 무거운 I/O를 S3에 맡겨 EC2의 용량과 트래픽 부담을 줄이는 구성입니다.

배포는 GitLab CI/CD가 빌드 후 트리거를 보내면, 배포 스크립트가 새 서버(Green)를 먼저 기동해 정상 여부를 확인한 뒤 트래픽을 전환하고 기존 서버(Blue)를 종료하는 blue-green 무중단 방식입니다. 백엔드 인프라와 배포 파이프라인은 팀(백엔드 2인) 담당 영역이었습니다.


# 선반 — 네 겹의 레이어와 3D 눈속임

---

- **문제** — 선반 편집 화면은 입력 감지 · 구분선 · 배치된 굿즈 · 미리보기가 한 그리드 위에 겹칩니다. 여기에 더해 편집이 끝나면, 평면 그리드가 비스듬한 픽셀 아트 선반처럼 보여야 했습니다.
- **해결** — 선반을 역할별 네 겹의 레이어로 분리하고, 편집 종료 시 네 레이어를 `transform`으로 통째로 비틀어 옆모습 선반 에셋에 면을 맞췄습니다.
- **결과** — 레이어마다 역할이 하나로 고정되어 인터랙션 코드가 얽히지 않고, 편집은 평면에서 정확하게, 전시는 3D처럼 보입니다.

전시의 핵심은 굿즈를 **선반에 원하는 크기로 배치**하는 편집 경험입니다. 편집 모드의 선반은 4×4 그리드 위에 네 겹의 레이어로 구성됩니다.

- **BackSlots** — 4×4 빈 슬롯. 드래그 시작·이동을 감지하는 입력 레이어입니다.
- **Dividers** — 행 구분선. 아이템이나 미리보기와 겹치는 위치에서는 숨겨집니다.
- **ShelfItems** — 실제 배치가 끝난 굿즈 이미지.
- **Preview** — 드래그로 선택 중인 영역과 굿즈 드롭 대기 상태를 보여주는 미리보기 박스.

![편집 선반의 레이어 구성 — 컴포넌트가 화면 요소에 그대로 대응](/content/projects/monimentoom/slide-shelf-layers.png)

편집 모드가 끝나면 이 네 레이어를 `transform`(skew · scale)으로 통째로 비틀어, 옆모습으로 그려 둔 선반 에셋에 면을 맞춥니다. 평면 그리드가 픽셀 아트 방의 비스듬한 선반으로 보이게 하는 눈속임입니다.

```tsx
// 편집 중에는 정면 그리드 그대로, 편집이 끝나면 skew·scale로 비틀어 옆모습 에셋에 면을 맞춘다
<div style={{ perspective: '1000px' }}>
  <div
    className={clsx(
      'relative grid h-full w-full grid-cols-4 ...',
      isEditMode
        ? 'transform-[translateZ(0px)_rotateY(0deg)_rotateX(0deg)_scale(1.0)]'
        : isLeft
          ? 'transform-[translateZ(100px)_translateX(4px)_skewY(-13.8deg)_scale(0.7)]'
          : 'transform-[translateZ(100px)_translateX(-4px)_skewY(13.8deg)_scale(0.7)]'
    )}
  >
```


# 선반 입력 — 마우스와 터치를 하나로

---

- **문제** — 영역을 드래그해 지정하는 편집 인터랙션이 마우스 hover에 의존하고 있어, hover가 없는 모바일 터치에서는 손가락이 지나는 셀을 알 수 없었습니다.
- **해결** — `onTouchMove`에서 `elementFromPoint`로 손가락 아래 셀을 역산해 마우스와 같은 핸들러로 전달하고, 굿즈 드롭은 데스크톱 드래그 앤 드롭과 모바일 탭 두 경로를 하나의 배치 로직으로 합류시켰습니다.
- **결과** — 입력 장치가 달라도 편집 로직은 한 벌로 유지되며, 데스크톱과 모바일이 같은 편집 경험을 제공합니다.

## 터치에는 hover가 없다

![선반 편집 모드 — 영역을 드래그해 선택하고 굿즈를 배치](/content/projects/monimentoom/shelf-edit.png)

가장 까다로웠던 것은 **하나의 인터랙션을 마우스와 터치 양쪽에서 자연스럽게** 만드는 일이었습니다. 마우스에는 있는 hover(`onMouseEnter`)가 터치에는 없어, 손가락이 지나는 셀을 알 수 없었습니다. 그래서 컨테이너 레벨의 `onTouchMove`에서 `elementFromPoint`로 손가락 아래 셀을 찾아 마우스와 **같은 핸들러로 전달했습니다**.

```tsx
onMouseUp={handleMouseUp}
onTouchMove={(e) => {
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const { r, c } = (el as HTMLElement)?.dataset ?? {};
  // 각 슬롯의 data-r / data-c 로 손가락 아래 셀을 역산 → 마우스와 동일 경로
  if (r !== undefined && c !== undefined) {
    handleMouseEnter({ r: Number(r), c: Number(c) });
  }
}}
onTouchEnd={handleMouseUp}
```

## 드롭은 두 경로, 배치 로직은 하나

굿즈를 얹는 방식도 환경별로 갈립니다. 데스크톱은 이미지를 선반으로 옮기는 네이티브 HTML5 드래그 앤 드롭(`dataTransfer`)을, 모바일은 `<img>`를 드래그할 수 없으니 **탭 → CustomEvent** 로 대체했습니다. 두 경로 모두 확정된 미리보기 영역이 받아 같은 배치 로직을 호출합니다.

```tsx
// 인벤토리 카드 = 드래그 소스(데스크톱) 겸 탭 소스(모바일)
onDragStart={(e) => {
  e.dataTransfer.setData('inventory-goods', JSON.stringify({ goodsId, imageUrl }));
  e.dataTransfer.effectAllowed = 'copy';
}}
onClick={() =>
  document.dispatchEvent(new CustomEvent('goods-tap-place', { detail: { goodsId, imageUrl } }))
}
```


# 지연 반영 — 편집은 즉시, 저장은 한 번에

---

- **문제** — 방에서는 액자 · 이젤 · 굿즈 등록 · 선반 배치처럼 편집 이벤트가 끊임없이 일어나는데, 이벤트마다 서버와 통신하면 특히 이미지 전송 같은 무거운 작업이 끼는 순간 편집이 눈에 띄게 끊겼습니다.
- **해결** — 편집 중에는 **Redux를 단일 소스로 삼아 로컬에서만 반영**하고, 저장 버튼을 누르는 순간 서버 스냅샷과 diff해 변경분만 한꺼번에 동기화했습니다.
- **결과** — 편집 중에는 네트워크 왕복이 없어 조작이 끊기지 않고, 서버에는 변경분만 정확히 반영됩니다.

이 로직은 `RoomContainer`에 모여 있습니다. 컨테이너는 방 데이터를 불러와 서버 위치(position)를 Redux 아이템으로 매핑합니다. 편집 모드가 끝나면 Redux 상태와 서버 스냅샷을 **diff** 해, 새로 생긴 위치는 create, 옮겨진 위치는 update, 사라진 위치는 delete를 한 번에 실행합니다. 화면을 그리는 `RoomScene`은 여기서 완전히 분리되어 JSX와 스케일 계산만 담당합니다.

```tsx
// 편집 종료 시 실행 — Redux 상태(items)와 서버 스냅샷(serverPositionsRef)을 diff
const syncPositions = useCallback(async (wallSide: WallSide, items: Item[]) => {
  const serverSide = serverPositionsRef.current.filter(p => p.wallSide === wallSide);
  const serverIds = new Set(serverSide.map(p => p.id));
  const currentIds = new Set(items.filter(i => i.positionId != null).map(i => i.positionId!));

  // DELETE — 서버에 있었지만 편집 후 사라진 위치
  const deletePromises = [...serverIds]
    .filter(id => !currentIds.has(id))
    .map(id => deletePosition(id));

  // PATCH — 좌표나 크기가 서버 원본과 달라진 위치만 갱신
  const updatePromises = items
    .filter(i => i.positionId != null && serverIds.has(i.positionId))
    .map(i => {
      const original = serverSide.find(p => p.id === i.positionId);
      const moved = original && (original.x !== i.r1 || original.y !== i.c1
        || original.widthUnit !== i.c2 - i.c1 + 1 || original.heightUnit !== i.r2 - i.r1 + 1);
      return moved
        ? updatePosition(i.positionId!, { goodsId: i.goodsId!, roomId, wallSide, ... })
        : Promise.resolve();
    });

  // POST — positionId가 없는 새 배치. 응답의 positionId는 Redux 아이템에 반영
  const createPromises = items
    .filter(i => i.positionId == null)
    .map(i => createPosition({ goodsId: i.goodsId!, roomId, wallSide, ... }));

  await Promise.all([...deletePromises, ...updatePromises, ...createPromises]);
}, [roomId, dispatch]);
```

> **Container / Component 분리** — 안드로이드에서 익힌 UI와 비즈니스 로직의 관심사 분리를, 기존 "컴포넌트 + 페이지" 구조에 중간 단계로 들여왔습니다. 컴포넌트는 UI 표시만, 컨테이너는 그것들을 모아 비즈니스 로직을 결합합니다.


# 토큰 이원화 — 어디에 저장하느냐의 문제

---

- **문제** — 백엔드가 access + refresh 토큰으로 인증을 관리해, 두 토큰을 프론트 어디에 보관할지 정해야 했습니다. XSS 탈취 위험과 매 요청 헤더에 담아 보내야 하는 사용성이 충돌하는 지점입니다.
- **해결** — 수명이 짧은 access 토큰은 `localStorage`에, 수명이 긴 refresh 토큰은 JS 접근이 차단된 HttpOnly 쿠키에 나눠 저장하고, 만료 시에는 인터셉터의 사일런트 재발급으로 원 요청을 재시도하도록 했습니다.
- **결과** — 탈취 피해가 큰 refresh 토큰은 스크립트로 읽을 수 없고, 사용자가 만료를 인지하지 못하는 사이 세션이 이어집니다.

두 토큰은 수명과 쓰임이 달라, 저장 위치도 다르게 정했습니다.

- **Access token → `localStorage`.** 수명이 짧아(1시간) 탈취되어도 피해가 제한적이고, 매 API 요청 헤더에 담아 보내야 하므로 JS에서 읽을 수 있어야 합니다. 따라서 JS 접근이 차단된 HttpOnly 쿠키는 저장 위치 후보에서 제외했습니다.
- **Refresh token → HttpOnly 쿠키.** 수명이 길어(7일) 탈취에 취약한 만큼 JS 접근을 차단하고, `/auth/refresh` 한 곳에만 쓰이니 요청 시 쿠키가 자동으로 따라붙는 편이 자연스럽습니다.

## 만료는 조용히 — 사일런트 재발급

access 토큰이 만료되어 401이 발생하면, 사용자가 눈치채기 전에 재발급받아 원래 요청을 다시 보냅니다. 관건은 **동시에 발생한 여러 401**입니다. 요청마다 각자 재발급을 요청하면 서버가 여러 번 호출되므로, 모듈 레벨 `refreshPromise` 하나로 묶어 **재발급은 한 번만** 수행하고, 나머지는 그 프라미스를 함께 기다리게 했습니다. 재발급까지 실패하면 저장소·Redux를 비우고 홈으로 강제 로그아웃합니다.

```ts
let refreshPromise: Promise<string> | null = null;

// 동시 401은 in-flight refresh 하나를 공유 → 서버는 한 번만 호출
const getNewAccessToken = () =>
  (refreshPromise ??= axios
    .post(`${BASE_URL}/auth/refresh`, null, { withCredentials: true }) // 쿠키의 refresh 토큰
    .then((res) => res.data.token)
    .then((token) => {
      localStorage.setItem('accessToken', token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    }));

// 응답 인터셉터 — 401이면 재발급 후 원 요청 재시도, 실패 시 강제 로그아웃
if (status === 401 && !isAuthFlow && !original._retry) {
  original._retry = true;
  try {
    const token = await getNewAccessToken();
    original.headers.Authorization = `Bearer ${token}`;
    return axiosInstance(original);
  } catch {
    forceLogout(); // 저장소·Redux 정리 후 window.location.href = '/'
    return Promise.reject(error);
  }
}
```

요청 인터셉터에서는 access 토큰을 헤더에 붙이되, 업로드처럼 `FormData`를 보낼 때는 `Content-Type`을 지워 브라우저가 multipart 경계를 직접 잡게 했습니다.


# 굿즈 이미지 — S3 프리사인드 업로드

---

- **문제** — 이미지가 백엔드를 경유하면 무거운 I/O가 서버에 쌓이고, 파일을 선택했다가 등록을 취소하면 사용되지 않는 파일이 스토리지에 남습니다.
- **해결** — 파일 선택 시에는 프리사인드 URL만 발급받아 두고, 등록 버튼을 눌러 확정할 때에만 **브라우저에서 S3로 직접 PUT**하도록 두 단계를 분리했습니다.
- **결과** — 서버는 이미지 I/O에서 벗어나고, 취소된 업로드는 S3에 파일을 남기지 않아 불필요한 용량이 쌓이지 않습니다.

파일명은 한글·특수문자 문제를 피하려 UUID로 정규화하고, 프리사인드 URL 자체가 인증을 대신하므로 업로드 요청에는 JWT를 붙이지 않습니다.

```ts
// 1) 파일 선택 시: 프리사인드 URL만 발급 (아직 업로드 X)
const { presignedUrl, imageUrl, contentType } =
  await getGoodsPresignedUrl(sanitizeFileName(file.name)); // 파일명 = crypto.randomUUID()

// 2) 등록 확정 시: S3로 직접 PUT 후, 반환된 URL만 DB에 저장
await uploadToS3(presignedUrl, file, contentType); // 프리사인드 URL 자체 인증 → JWT 불필요
await createGoods({ name, description, imageUrl });
```


# 반응형 — 하나의 방, 모든 화면

---

- **문제** — 방은 자연 크기 1280×1000을 기준으로 요소를 절대 좌표로 얹은 픽셀 아트이기 때문에, 일반적인 반응형 규칙을 적용하면 좁은 화면에서 구도가 무너집니다.
- **해결** — 래퍼 폭을 `ResizeObserver`로 관찰해 `scale = min(1, 폭 / 1280)`을 구하고, `transform: scale`로 방 전체를 비례 축소했습니다.
- **결과** — 데스크톱은 1:1 그대로, 모바일은 같은 구도를 유지한 채 작아져 어느 화면에서도 레이아웃이 무너지지 않습니다.

축소만 허용하고 확대는 하지 않으므로(최대 1), 원본보다 큰 화면에서도 픽셀이 뭉개지지 않습니다.

```tsx
const ROOM_NATURAL_WIDTH = 1280;
const [scale, setScale] = useState(1);

useEffect(() => {
  const observer = new ResizeObserver(([entry]) => {
    setScale(Math.min(1, entry.contentRect.width / ROOM_NATURAL_WIDTH)); // 축소만, 확대는 안 함
  });
  observer.observe(wrapperRef.current);
  return () => observer.disconnect();
}, []);
// <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}> … 방 … </div>
```

![방 — 전시 공간과 방문자 댓글·좋아요](/content/projects/monimentoom/room.png)


# 성과

---

- 모빌리티SW스쿨 2차 프로젝트 발표에서 **웹 어플리케이션 개발 프로젝트 우수상**을 수상했습니다.


# 배운 점

---

## 안드로이드 경험의 이식

Axios 인터셉터로 토큰 자동 재발급과 401 처리를 구현하면서, 안드로이드에서 사용하던 Retrofit2 + OkHttp Interceptor 구조와 매우 닮았다고 느꼈습니다. 덕분에 낯선 웹 스택에서도 통신 계층을 초반에 빠르게 안정시킬 수 있었습니다.

## 상태를 어디에 둘 것인가

서버 상태와 클라이언트 상태의 책임을 나누니 데이터 흐름의 복잡도가 줄고 캐시 전략도 단순해졌습니다. 기능을 구현하기 전에 **어떤 상태를 어디에 둘지 정하는 설계 단계**가 결과를 크게 좌우한다는 것을 직접 체감했습니다.

## 마우스에서 터치로

데스크톱 기준으로 구현한 드래그 로직을 모바일 터치로 옮기며, hover의 부재처럼 이벤트 모델 차이에서 오는 엣지케이스를 여럿 겪었습니다. UX 요구와 기술적 제약 사이에서 절충점을 찾는 과정 자체가 값진 학습이었습니다.


# 관련 자료

---

[발표 슬라이드](/files/monimentoom-presentation.pdf)

[시연 영상](https://youtu.be/pbEECx4b8i8)
