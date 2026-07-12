import { cn } from '@/lib/cn';

interface ProjectKindChipProps {
  kind: 'team' | 'personal';
  className?: string;
}

/**
 * 팀 프로젝트 / 개인 프로젝트 구분 칩 — 목록·상세에서 공용.
 * 배경을 반투명 액센트가 아니라 캔버스와 같은 짙은 단색으로 둔다 — 썸네일 위에 얹히는데
 * 밝은 화면(흰 배경 스크린샷 등)을 만나면 반투명 배경이 비쳐 글자가 읽히지 않기 때문이다.
 * 팀은 액센트(그린), 개인은 중립(zinc)으로 구분하고, 라운드 없이 hairline 테두리만 둬
 * 격자 칸 위에서도 도면 톤을 유지한다.
 */
export function ProjectKindChip({ kind, className }: ProjectKindChipProps) {
  const isTeam = kind === 'team';
  return (
    <span
      className={cn(
        'inline-flex items-center border bg-[#111113]/92 px-2 py-0.5 font-mono text-[11px]',
        isTeam ? 'border-accent/60 text-accent' : 'border-zinc-500/60 text-zinc-300',
        className,
      )}
    >
      {isTeam ? '팀 프로젝트' : '개인 프로젝트'}
    </span>
  );
}
