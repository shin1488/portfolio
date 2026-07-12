import { cn } from '@/lib/cn';
import type { ContributionStatus } from '@/types/content';

/**
 * 기여의 단계 — 제안(이슈 제기) → 리뷰 중(PR 열림) → 병합.
 * 색은 진행도를 따라간다: 제안은 로즈, 리뷰 중은 블루, 병합은 그린(액센트).
 * 배경은 프로젝트 구분 칩과 같은 규칙으로 캔버스와 같은 짙은 단색이고, 라운드 없이 hairline만 둔다.
 */
const STATUS = {
  proposed: { label: '제안', className: 'border-accent-rose/60 text-accent-rose' },
  'in-review': { label: '리뷰 중', className: 'border-accent-end/60 text-accent-end' },
  merged: { label: '병합', className: 'border-accent/60 text-accent' },
} as const satisfies Record<ContributionStatus, { label: string; className: string }>;

export function ContributionStatusChip({
  status,
  className,
}: {
  status: ContributionStatus;
  className?: string;
}) {
  const { label, className: tone } = STATUS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center border bg-[#111113]/92 px-2 py-0.5 text-[11px]',
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}

/** 저장소 — 문서에 적힌 표기 그대로 'organization/repo'로 적되, 소유자는 흐리게 둬
    저장소 이름이 먼저 읽히게 한다. */
export function RepoName({
  organization,
  repo,
  className,
}: {
  organization: string;
  repo: string;
  className?: string;
}) {
  return (
    <span className={cn('text-[11px] text-zinc-500', className)}>
      {organization}/<span className="text-zinc-300">{repo}</span>
    </span>
  );
}
