import { useState, type Ref } from 'react';
import { Frame } from '@/components/layout/Frame';
import type { Profile } from '@/types/content';

interface ProfileSectionProps {
  profile: Profile;
  /** 라우트 전환 시 페이지 제목으로 포커스를 옮기기 위한 ref */
  headingRef?: Ref<HTMLHeadingElement>;
}

/** 히어로 — 프레임 안 좌측 정렬 인트로. 좌상단에서 번지는 그린 글로우가 유일한 색이다. */
export function ProfileSection({ profile, headingRef }: ProfileSectionProps) {
  return (
    <section id="profile" aria-label="Profile" className="scroll-mt-11">
      {/* 헤더(44px)를 뺀 첫 화면을 히어로가 채운다 */}
      <Frame className="relative flex min-h-[calc(100svh-2.75rem-env(safe-area-inset-top))] flex-col justify-center overflow-hidden">
        {/* 액센트 글로우 — 좌상단 그린, 우하단 블루. 크기를 비대칭으로 둬(그린이 크고 블루가 작다)
            1:1 대칭에서 오는 단조로움을 없애고, 그린이 중앙을 넘어 뻗어 블루와 겹치게 해 두 색이
            섞이는 구간을 만든다. 색은 color-mix로 @theme 토큰을 직접 끌어와 토큰을 바꾸면 따라온다.
            프레임 밖으로 새지 않도록 Frame이 overflow-hidden으로 잘라낸다. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(120% 110% at -8% -10%, color-mix(in srgb, var(--color-accent) 34%, transparent), transparent 78%)',
              'radial-gradient(66% 72% at 104% 106%, color-mix(in srgb, var(--color-accent-end) 42%, transparent), transparent 70%)',
            ].join(','),
          }}
        />

        {/* 좌측 여백은 다른 섹션(px-8)보다 넉넉하게 — 초대형 이름이 프레임 선에 붙지 않게 한다.
            사진은 텍스트 블록과 세로 중앙을 맞춘다. */}
        <div className="relative grid gap-12 px-6 py-24 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-16 md:px-16">
          <div>
            {/* 역할 — 로고 호버와 같은 그라데이션이 상시 흐른다(breathing) */}
            <p className="w-fit animate-[logo-flow_4s_linear_infinite] bg-linear-to-r from-accent via-accent-end to-accent bg-size-[200%_auto] bg-clip-text text-[15px] font-bold tracking-tight text-transparent md:text-lg">
              {profile.role}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-4 text-[64px] font-bold leading-[1.02] tracking-[-0.05em] text-zinc-100 outline-none sm:text-[96px] lg:text-[124px]"
            >
              {profile.name}
            </h1>
            {/* 쉼표에서 줄바꿈 — 어색한 중간 지점 대신 문장 호흡 단위로 끊는다 */}
            <p className="mt-6 max-w-xl text-[15px] leading-[1.75] text-zinc-400 md:text-lg">
              {profile.tagline.split(/,\s*/).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <>
                      ,<br />
                    </>
                  )}
                </span>
              ))}
            </p>

            {/* 연락처는 하단 독이 상시 노출하므로 여기서는 위치만 둔다 */}
            {profile.location && (
              <p className="mt-9 font-mono text-[11px] text-zinc-500">{profile.location}</p>
            )}
          </div>

          <Avatar profile={profile} />
        </div>

        {/* 스크롤 힌트 — 하단 중앙은 연락처 독이 차지하므로 우측 하단 모서리에 둔다.
            글로우 위에 얹히므로 배경과 묻히지 않게 밝기를 올리고 화살표를 키웠다. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-5 flex items-center gap-2.5 text-zinc-300 md:right-8"
        >
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em]">
            Scroll
          </span>
          <span className="scroll-hint-arrow text-[19px] leading-none text-accent">↓</span>
        </div>
      </Frame>
    </section>
  );
}

/**
 * 프로필 사진 — 인물 사진의 원본 비율(세로 3:4)에 맞춘 세로 직사각형. 정사각으로 자르면
 * 어깨와 머리 위가 잘려 구도가 어긋나므로, 도면 톤은 hairline 테두리로만 유지한다.
 */
function Avatar({ profile }: { profile: Profile }) {
  const [imageFailed, setImageFailed] = useState(false);
  const box = 'w-28 shrink-0 aspect-3/4 border border-divider object-cover md:w-44';

  if (profile.avatarImageUrl && !imageFailed) {
    return (
      <img
        src={profile.avatarImageUrl}
        alt={`${profile.name} 프로필 사진`}
        onError={() => setImageFailed(true)}
        className={box}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${profile.name} 프로필 사진 자리`}
      className={`${box} flex items-center justify-center bg-zinc-900 font-mono text-2xl font-bold text-accent`}
    >
      {profile.avatarInitials}
    </div>
  );
}
