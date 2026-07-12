interface DividerLabelProps {
  label: string;
}

/** 수평선 가운데에 라벨을 얹은 카테고리 구분자 — 선을 라벨 양옆 두 조각으로 나눠,
    라벨 뒤에 배경(마스킹용 박스) 없이도 선이 텍스트를 관통하지 않게 한다.
    덕분에 라벨 배경이 투명해 뒤의 앰비언트 그라데이션이 그대로 비친다. */
export function DividerLabel({ label }: DividerLabelProps) {
  return (
    <div className="flex items-center gap-4" role="presentation">
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      <span className="shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
