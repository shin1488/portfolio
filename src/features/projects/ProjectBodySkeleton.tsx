/**
 * 팝업 본문이 로드되는 동안 보여 주는 스켈레톤 — 실제 문서의 뼈대(섹션 제목 + 밑줄, 소제목,
 * 문단 줄, 이미지 블록)를 같은 간격으로 흉내 낸다. 스피너와 달리 로드가 끝났을 때 레이아웃이
 * 크게 뒤집히지 않아, 채워지는 느낌으로 이어진다.
 */
export function ProjectBodySkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      {/* 섹션 제목 + 액센트 밑줄 */}
      <div className="h-8 w-52 rounded bg-zinc-800" />
      <div className="mt-2 h-[3px] w-52 rounded bg-zinc-700" />

      {/* 소제목 + 문단 */}
      <div className="mt-9 h-5 w-40 rounded bg-zinc-800" />
      <div className="mt-4 space-y-2.5">
        <div className="h-3.5 w-full rounded bg-zinc-800/70" />
        <div className="h-3.5 w-[92%] rounded bg-zinc-800/70" />
        <div className="h-3.5 w-[78%] rounded bg-zinc-800/70" />
      </div>

      <div className="mt-8 space-y-2.5">
        <div className="h-3.5 w-[88%] rounded bg-zinc-800/70" />
        <div className="h-3.5 w-full rounded bg-zinc-800/70" />
        <div className="h-3.5 w-[64%] rounded bg-zinc-800/70" />
      </div>

      {/* 이미지 블록 */}
      <div className="mt-10 aspect-16/9 w-full rounded-xl border border-divider bg-zinc-900" />

      <div className="mt-10 h-5 w-44 rounded bg-zinc-800" />
      <div className="mt-4 space-y-2.5">
        <div className="h-3.5 w-full rounded bg-zinc-800/70" />
        <div className="h-3.5 w-[84%] rounded bg-zinc-800/70" />
      </div>
    </div>
  );
}
