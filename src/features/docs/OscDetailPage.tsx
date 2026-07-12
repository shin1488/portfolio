import { useParams } from 'react-router';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { content } from '@/data';
import { ContributionStatusChip, RepoName } from './ContributionMeta';
import { DocDetailView } from './DocDetailView';

/** 라우트 단위 code-split 대상이라 default export를 사용한다. */
export default function OscDetailPage() {
  const { contributionId } = useParams();
  const index = content.contributions.findIndex(
    (contribution) => contribution.id === contributionId,
  );
  const contribution = content.contributions[index];

  if (!contribution) {
    return <NotFoundView />;
  }
  return (
    <DocDetailView
      doc={contribution}
      listHash="#osc"
      basePath="/osc"
      backLabel="기여 목록"
      docIndex={index}
      titleAside={<ContributionStatusChip status={contribution.status} className="mt-1.5 shrink-0" />}
      periodPrefix={
        <RepoName
          organization={contribution.organization}
          repo={contribution.repo}
          className="text-sm"
        />
      }
    />
  );
}
