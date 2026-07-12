import { cn } from '@/lib/cn';
import type { Doc } from '@/types/content';

/**
 * 라벨 끝의 번호(#19436)만 떼어 낸다 — 번호는 이름이 아니라 꼬리표라 한 단 흐리게 그린다.
 * 주소도 이름도 만들지 않는다. 무엇을 어디로 걸지는 문서의 links가 전부 정한다.
 */
function splitNumber(label: string): { name: string; number?: string } {
  const match = /^(.*?)\s+(#\d+)$/.exec(label);
  return match ? { name: match[1], number: match[2] } : { name: label };
}

/** 문서의 바로가기 목록(GitHub·이슈·PR·데모 등) — 카드·상세에서 공용 */
export function DocLinks({ doc, className }: { doc: Doc; className?: string }) {
  if (doc.links.length === 0) {
    return null;
  }
  return (
    <div className={cn('flex flex-wrap gap-x-5 gap-y-2', className)}>
      {doc.links.map((link, index) => {
        const { name, number } = splitNumber(link.label);
        return (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            // 라벨 중간에서 접히지 않게 한다 — 접히는 단위는 링크 하나다.
            className="group/link inline-flex items-baseline gap-1 whitespace-nowrap text-[13px]"
          >
            <span className="bg-linear-to-r from-accent to-accent-end bg-clip-text font-semibold text-zinc-300 transition-colors group-hover/link:text-transparent">
              {name}
            </span>
            {number && <span className="font-medium text-zinc-600">{number}</span>}
            <span aria-hidden="true" className="text-[11px] text-zinc-600">
              ↗
            </span>
            <span className="sr-only"> — {doc.title} (새 탭에서 열림)</span>
          </a>
        );
      })}
    </div>
  );
}
