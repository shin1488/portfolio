import { Frame } from './Frame';

export function Footer() {
  return (
    <footer className="border-t border-divider">
      {/* pb는 하단 연락처 독(ContactDock)에 가려지지 않을 여백 확보용 */}
      <Frame className="flex items-center justify-between px-5 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-9 font-mono text-[11px] text-zinc-600 md:px-8">
        <p>© {new Date().getFullYear()} Shin Yeongchan</p>
        <p aria-hidden="true">portfolio/</p>
      </Frame>
    </footer>
  );
}
