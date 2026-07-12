import { SideRail } from '@/components/ui/SideRail';
import { NAV_ITEMS } from '@/lib/nav';
import { scrollToSection, useActiveSection } from '@/lib/section';

/**
 * 홈의 섹션 rail(스크롤 스파이) — 표시와 동작은 SideRail이 담당하고, 여기서는 무엇을 보여줄지
 * (섹션 목록·현재 섹션·클릭 시 이동)만 넘긴다. 상세 페이지의 목차 rail과 같은 컴포넌트다.
 */
export function SectionRail() {
  const ids = NAV_ITEMS.map((item) => item.id);
  const active = useActiveSection(ids);

  return (
    <SideRail
      ariaLabel="섹션 이동"
      items={NAV_ITEMS.map((item) => ({ id: item.id, label: item.label }))}
      activeId={active}
      onSelect={scrollToSection}
    />
  );
}
