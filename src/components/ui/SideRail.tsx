import { cn } from '@/lib/cn';

export interface SideRailItem {
  id: string;
  label: string;
}

interface SideRailProps {
  items: SideRailItem[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  /**
   * 확장형 rail을 화면 중앙에서 얼마나(rem) 오른쪽에 놓을지. 본문 폭이 화면마다 다르므로
   * (홈 프레임 72rem, 상세 본문 48rem) 본문 우측 경계 바깥에 붙도록 호출부가 정한다.
   */
  expandedOffsetRem: number;
}

/**
 * 우측 세로 rail — 홈의 섹션 이동과 상세 페이지의 목차 이동이 같은 컴포넌트를 쓴다.
 * 화면 폭에 따라 두 모습으로 갈린다.
 * - 프레임 바깥에 라벨을 펼칠 자리가 없을 때(~2xl): 뷰포트 우측 끝에 틱만 두고, 마우스를 대면
 *   라벨이 왼쪽으로 펼쳐진다.
 * - 자리가 넉넉할 때(2xl+): 프레임(72rem) 바깥 여백에 틱과 라벨을 상시 노출한다.
 * 어느 쪽이든 활성 항목은 틱이 길어지고 라벨에 액센트 그라데이션이 걸린다.
 */
export function SideRail({
  items,
  activeId,
  onSelect,
  ariaLabel,
  expandedOffsetRem,
}: SideRailProps) {
  return (
    <>
      <nav
        aria-label={ariaLabel}
        className="group fixed right-0 top-1/2 z-30 hidden max-h-[85vh] -translate-y-1/2 flex-col items-end gap-1 overflow-y-auto py-3 pl-8 pr-1.5 lg:flex 2xl:hidden"
      >
        {items.map((item) => (
          <CollapsedItem
            key={item.id}
            item={item}
            active={item.id === activeId}
            onSelect={onSelect}
          />
        ))}
      </nav>

      <nav
        aria-label={ariaLabel}
        style={{ left: `calc(50% + ${expandedOffsetRem}rem)` }}
        className="fixed top-1/2 z-30 hidden max-h-[76vh] -translate-y-1/2 overflow-y-auto 2xl:block"
      >
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <ExpandedItem item={item} active={item.id === activeId} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

/** 활성 라벨에 얹는 액센트 그라데이션 — 두 모습이 같은 규격을 쓰도록 한 곳에 둔다. */
const ACTIVE_LABEL = 'bg-linear-to-r from-accent to-accent-end bg-clip-text text-transparent';

function CollapsedItem({
  item,
  active,
  onSelect,
}: {
  item: SideRailItem;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active}
      className="flex w-full cursor-pointer items-center justify-end rounded-md py-2 pl-2 pr-2.5 transition-colors hover:bg-zinc-500/30"
    >
      {/* 라벨 — 평소 max-w-0(숨김), rail에 마우스를 대면 왼쪽으로 펼쳐진다 */}
      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-60 group-hover:opacity-100">
        <span
          className={cn(
            'block truncate pr-2.5 font-mono text-[11px]',
            active ? `font-medium ${ACTIVE_LABEL}` : 'text-zinc-400',
          )}
        >
          {item.label}
        </span>
      </span>
      {/* 틱 — 라벨의 오른쪽에 붙으므로 그라데이션 끝색(accent-end)으로 둬야 색이 이어진다 */}
      <span
        aria-hidden="true"
        className={cn(
          'h-0.5 shrink-0 rounded-full transition-all',
          active ? 'w-5 bg-accent-end' : 'w-2.5 bg-zinc-600',
        )}
      />
    </button>
  );
}

function ExpandedItem({
  item,
  active,
  onSelect,
}: {
  item: SideRailItem;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active}
      className="group/item flex cursor-pointer items-center gap-2.5 rounded-md py-2 pl-3 pr-3.5 font-mono text-[11px] transition-colors hover:bg-zinc-500/30"
    >
      {/* 틱 — 라벨의 왼쪽에 붙으므로 그라데이션 시작색(accent)으로 둔다 */}
      <span
        aria-hidden="true"
        className={cn(
          'h-px shrink-0 transition-all',
          active ? 'w-5 bg-accent' : 'w-2.5 bg-zinc-600',
        )}
      />
      {/* 회색 라벨과 그라데이션 라벨을 겹쳐 두고 활성 시 그라데이션만 페이드인(깜빡임 없음) */}
      <span className="grid text-left">
        <span className="col-start-1 row-start-1 line-clamp-1 max-w-42 text-zinc-500 transition-colors group-hover/item:text-zinc-200">
          {item.label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'col-start-1 row-start-1 line-clamp-1 max-w-42 transition-opacity',
            ACTIVE_LABEL,
            active ? 'opacity-100' : 'opacity-0',
          )}
        >
          {item.label}
        </span>
      </span>
    </button>
  );
}
