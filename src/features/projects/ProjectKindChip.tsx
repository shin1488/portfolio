import { cn } from '@/lib/cn';

interface ProjectKindChipProps {
  kind: 'team' | 'personal';
  className?: string;
}

/**
 * 팀 프로젝트 / 개인 프로젝트 구분 칩 — 목록·상세에서 공용.
 * 팀은 액센트(그린), 개인은 중립(zinc)으로 대비를 준다. 라운드 없이 hairline 테두리만 둬
 * 격자 칸 위에 얹혀도 도면 톤에서 벗어나지 않게 한다.
 */
export function ProjectKindChip({ kind, className }: ProjectKindChipProps) {
  const isTeam = kind === 'team';
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2 py-0.5 font-mono text-[11px] backdrop-blur-sm',
        isTeam
          ? 'border-green-400/40 bg-green-500/15 text-green-300'
          : 'border-zinc-500/40 bg-zinc-900/60 text-zinc-300',
        className,
      )}
    >
      {isTeam ? '팀 프로젝트' : '개인 프로젝트'}
    </span>
  );
}
