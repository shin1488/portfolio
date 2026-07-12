import type { Project } from '@/types/content';

export function formatPeriod({ from, to }: Project['period']): string {
  return `${from} – ${to ?? '진행 중'}`;
}
