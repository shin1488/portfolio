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
        {/* 액센트 글로우 — 좌상단 그린, 우하단 블루. 액센트 두 색이 히어로를 대각으로 가로지른다.
            색은 color-mix로 @theme 토큰에서 직접 끌어와, 토큰을 바꾸면 글로우도 따라온다.
            프레임 밖으로 새지 않도록 Frame이 overflow-hidden으로 잘라낸다. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(62% 62% at 0% 0%, color-mix(in srgb, var(--color-accent) 20%, transparent), transparent 72%)',
              'radial-gradient(62% 62% at 100% 100%, color-mix(in srgb, var(--color-accent-end) 26%, transparent), transparent 72%)',
            ].join(','),
          }}
        />

        <div className="relative grid gap-12 px-5 py-24 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16 md:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400 md:text-[13px]">
              {profile.role}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-5 text-[64px] font-bold leading-[1.02] tracking-[-0.05em] text-zinc-100 outline-none sm:text-[96px] lg:text-[124px]"
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

        {/* 스크롤 힌트 — 하단 중앙은 연락처 독이 차지하므로 우측 하단 모서리에 주석처럼 둔다 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-5 flex items-center gap-2 text-zinc-600 md:right-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <span className="scroll-hint-arrow text-[15px] leading-none">↓</span>
        </div>
      </Frame>
    </section>
  );
}

/** 프로필 사진 — 도면 톤에 맞춰 원형 대신 hairline 테두리의 정사각으로 둔다. */
function Avatar({ profile }: { profile: Profile }) {
  const [imageFailed, setImageFailed] = useState(false);
  const box = 'size-24 shrink-0 border border-divider object-cover md:size-36';

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
