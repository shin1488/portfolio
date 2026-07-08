export function Footer() {
  return (
    <footer className="border-t border-zinc-900">
      {/* pb는 하단 연락처 독(ContactDock)에 가려지지 않을 여백 확보용(96px) */}
      <div className="mx-auto max-w-5xl px-6 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-11 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} Shin Yeongchan</p>
      </div>
    </footer>
  );
}
