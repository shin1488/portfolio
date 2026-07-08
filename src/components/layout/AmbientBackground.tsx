/**
 * 사이트 전역 앰비언트 배경 — 어두운 캔버스(html #0d0b14) 위에 브랜드 인디고→핑크
 * 글로우를 아주 옅게 얹어 깊이감을 준다. -z-10으로 본문 뒤에 두며,
 * pointer-events-none이라 상호작용을 가로채지 않는다.
 * 액센트(진행바·활성 nav·로고·차트)와 같은 계열이지만 alpha를 매우 낮추고(0.10~0.22)
 * 크게 blur해, 선명한 액센트와 경쟁하지 않는 은은한 워시로만 깔린다.
 *
 * 오브는 정지 상태고, 컨테이너(.ambient-hue)에 건 hue-rotate로 전체 색만 천천히 옮긴다.
 *
 * 밴딩 완화(채널톡 방식): 그라데이션을 alpha 0(투명)까지 넓게 빼지 않고 같은 계열 어두운
 * 색의 낮은 alpha로 마감한다. 옅은 꼬리를 길게 안 깔아 8비트 계단이 번질 자리가 없고,
 * 화면 밖 dissolve는 gradient 램프가 아니라 blur가 담당한다(가우시안이라 계단 X).
 * 노이즈/디더 오버레이 없이도 깨끗하다(실측상 노이즈 효과가 미미해 제거).
 */
export function AmbientBackground() {
  return (
    /* fixed가 아니라 문서 앵커(absolute) + 내부 sticky 2겹 구조인 이유 — iOS Safari는
       하단 주소창·툴바 뒤/아래 영역에 '문서 흐름 안 콘텐츠'만 그려 주고, fixed 레이어는
       레이아웃 뷰포트 바닥에서 끊는다. 오브를 fixed로 그리면 바가 펼쳐질 때 그 경계 아래로
       캔버스색만 남아 페이지가 일자로 잘린 검은 띠처럼 보인다. sticky(top-0, h-lvh)는
       문서 콘텐츠라 바 영역까지 렌더되면서도 스크롤을 따라와, fixed와 동일한
       '뷰포트에 붙은 오브' 시각을 유지한다. 바깥 absolute는 문서 전체 높이를 덮는
       트랙이고 오브 bleed는 overflow-clip으로 차단 — hidden이면 스크롤 컨테이너가 생겨
       sticky가 뷰포트 대신 이 컨테이너에 붙어 버린다(clip은 스크롤 컨테이너를 안 만듦). */
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
      <div className="ambient-hue sticky top-0 h-lvh overflow-hidden">
      {/* 좌상단 인디고 글로우 — 헤더·로고 근처에서 은은하게 번진다(브랜드 그라데이션 시작색) */}
      <div
        className="absolute -left-40 -top-48 size-[42rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22), rgba(49,46,120,0.06))' }}
      />
      {/* 우측 핑크 글로우 — 화면 중단 오른쪽에서 대각선으로 브랜드 그라데이션 끝색을 준다 */}
      <div
        className="absolute -right-32 top-[22%] size-[38rem] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.16), rgba(110,28,74,0.05))' }}
      />
      {/* 화면 정중앙 바이올렛 톤 — 넓고 옅게 깔아 중앙 허전함을 채운다.
         본문이 얹히는 자리라 alpha를 낮춰 가독성을 지킨다. */}
      <div
        className="absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10), rgba(52,40,104,0.04))' }}
      />
      {/* 하단 좌측 인디고-바이올렛 톤 — 아래쪽 여백을 채우고 좌측에 인디고를 퍼뜨려 대각선 균형을 준다 */}
      <div
        className="absolute -bottom-52 left-1/3 size-[40rem] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(120,90,240,0.16), rgba(46,40,110,0.05))' }}
      />
      </div>
    </div>
  );
}
