/**
 * 사이트 전역 앰비언트 배경 — 어두운 베이스(body bg-zinc-950) 위에 파랑 글로우를
 * 흐릿하게 얹어 깊이감을 준다. fixed로 뷰포트에 고정하고 -z-10으로 본문 뒤에 두며,
 * pointer-events-none이라 상호작용을 가로채지 않는다.
 * 액센트(인디고·핑크)와 겹치지 않도록 배경은 일부러 다른 계열인 파랑으로 둔다 —
 * 배경까지 인디고-핑크면 액센트가 배경에 묻혀 안 도드라지기 때문.
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
    <div aria-hidden="true" className="ambient-hue pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 좌상단 파랑 글로우 — 헤더 근처에서 은은하게 번진다 */}
      <div
        className="absolute -left-40 -top-48 size-[42rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(56,150,230,0.22), rgba(24,66,132,0.06))' }}
      />
      {/* 우측 시안-블루 글로우 — 화면 중단 오른쪽에서 대각선으로 대비를 준다 */}
      <div
        className="absolute -right-32 top-[22%] size-[38rem] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(22,140,200,0.18), rgba(12,66,116,0.05))' }}
      />
      {/* 화면 정중앙 파랑 톤 — 넓고 옅게 깔아 중앙 허전함을 채운다.
         본문이 얹히는 자리라 alpha를 낮춰 가독성을 지킨다. */}
      <div
        className="absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(48,120,210,0.11), rgba(24,60,120,0.04))' }}
      />
      {/* 하단 좌측 딥블루 톤 — 아래쪽 여백을 채우고 좌측에 파랑을 퍼뜨려 대각선 균형을 준다 */}
      <div
        className="absolute -bottom-52 left-1/3 size-[40rem] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(37,110,220,0.18), rgba(18,56,120,0.05))' }}
      />
    </div>
  );
}
