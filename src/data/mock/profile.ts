import type { Profile } from '@/types/content';

export const profile: Profile = {
  name: '신영찬',
  role: 'AI-Native Engineer',
  tagline:
    'AI를 주도적으로 활용하여 스택의 제약을 넘고, 완성도 높은 서비스를 구현하고자 하는 AI-Native Engineer입니다.',
  bio: [
    '백엔드를 주력으로 개발하고 있지만, 기술 스택에 얽매이지 않으려 합니다. 서비스에 필요한 기능이라면 AI를 적극적으로 활용해 분야에 한계를 두지 않고 유연하게 구현해 낼 수 있습니다.',
    'AI가 코드 작성 속도를 비약적으로 높여줄 수는 있지만, 그 결과물을 온전히 제어하는 것은 결국 엔지니어의 몫이라고 생각합니다. 블랙박스처럼 AI가 내어준 코드를 맹신하는 대신, 제가 설계한 구조 안에서 로직이 의도대로 정확히 동작하는지 면밀히 검증하고 다듬어가려 노력하고 있습니다.',
    '단순히 동작만 하는 로직이나, 보이기만 하는 화면을 만드는 것을 경계합니다. 서버의 데이터 처리와 예외 상황을 철저히 대비해 시스템의 오류를 줄이는 동시에, 사용자가 직접 마주하는 화면의 동선과 디테일(UX)까지 동일한 비중으로 결합하여 완성도 높은 서비스를 고민하는 꼼꼼한 개발자입니다.',
  ],
  avatarInitials: 'SYC',
  avatarImageUrl: '/images/profile.jpg',
  location: 'Seoul, Korea',
  links: [
    { kind: 'github', label: 'GitHub', href: 'https://github.com/shin1488' },
    { kind: 'email', label: 'Email', href: 'mailto:shin1488dev@gmail.com' },
    // Blog(Notion)은 추후 추가 예정 — kind: 'blog' 아이콘/타입은 유지되어 있음
  ],
};
