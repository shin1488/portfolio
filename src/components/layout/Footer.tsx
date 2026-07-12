import { Frame } from './Frame';

export function Footer() {
  return (
    <footer className="border-t border-divider">
      {/* pb는 바닥에 떠 있는 것들에 가려지지 않을 여백 확보용 — 넓은 화면은 연락처 독(ContactDock),
          좁은 화면은 상세 페이지의 '맨 위로' 버튼이 이 자리를 지난다. 화면마다 다르게 주면 어느
          쪽이든 한 번은 겹치므로, 가장 큰 몫(6rem)으로 통일한다. */}
      <Frame className="flex items-center justify-between px-5 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-9 text-[11px] text-zinc-600 md:px-8">
        <p>© {new Date().getFullYear()} Shin Yeongchan</p>
        <p aria-hidden="true">portfolio/</p>
      </Frame>
    </footer>
  );
}
