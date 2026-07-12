/** 헤더 네비게이션과 각 섹션의 anchor id를 한 곳에서 관리한다. */
export interface NavItem {
  id: string;
  label: string;
}

export const NAV_ITEMS = [
  { id: 'profile', label: 'Profile' },
  { id: 'about', label: 'Introduction' },
  { id: 'osc', label: 'Open Source' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'careers', label: 'Careers' },
] as const satisfies readonly NavItem[];

export type SectionId = (typeof NAV_ITEMS)[number]['id'];
