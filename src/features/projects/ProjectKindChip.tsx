import { cn } from '@/lib/cn';

interface ProjectKindChipProps {
  kind: 'team' | 'personal';
  className?: string;
}

/** 팀 프로젝트(메인=인디고) / 개인 프로젝트(서브=핑크) 구분 칩 — 목록·상세에서 공용. */
export function ProjectKindChip({ kind, className }: ProjectKindChipProps) {
  const isTeam = kind === 'team';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        isTeam
          ? 'border-indigo-500/35 bg-indigo-500/10 text-indigo-300'
          : 'border-pink-500/35 bg-pink-500/10 text-pink-300',
        className,
      )}
    >
      {isTeam ? '팀 프로젝트' : '개인 프로젝트'}
    </span>
  );
}
