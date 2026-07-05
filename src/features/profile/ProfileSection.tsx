import { useState, type Ref } from 'react';
import type { Profile } from '@/types/content';

interface ProfileSectionProps {
  profile: Profile;
  /** 라우트 전환 시 페이지 제목으로 포커스를 옮기기 위한 ref */
  headingRef?: Ref<HTMLHeadingElement>;
}

/** Hero — 한 화면 꽉 채운 중앙 정렬 인트로 + 하단 스크롤 힌트. 자기소개는 Introduction 섹션. */
export function ProfileSection({ profile, headingRef }: ProfileSectionProps) {
  return (
    // -mt-14: 흐름을 차지하는 sticky 헤더(h-14, 56px)만큼 위로 끌어올려, 최상단(scroll=0)에서도
    // 히어로가 뷰포트 정중앙에 오게 한다(로고 클릭 시 착지 지점과도 일치 → 위치 튐 없음).
    <section
      id="profile"
      aria-label="소개"
      className="relative -mt-14 flex min-h-screen scroll-mt-14 flex-col items-center justify-center px-6 text-center"
    >
      <div className="mx-auto max-w-xl">
        <Avatar profile={profile} />
        <p className="mt-[26px] text-[15px] font-semibold text-indigo-400">{profile.role}</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-1.5 text-[46px] font-bold leading-tight tracking-[-0.02em] text-zinc-100 outline-none"
        >
          {profile.name}
        </h1>
        <p className="mx-auto mt-[18px] max-w-[580px] text-xl leading-relaxed text-zinc-300">
          {profile.tagline}
        </p>
        {profile.location && <p className="mt-4 text-sm text-zinc-500">{profile.location}</p>}
      </div>

      {/* 스크롤 힌트 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[18vh] flex flex-col items-center gap-[7px] text-zinc-600"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">Scroll</span>
        <span className="scroll-hint-arrow text-[19px] leading-none">↓</span>
      </div>
    </section>
  );
}

function Avatar({ profile }: { profile: Profile }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (profile.avatarImageUrl && !imageFailed) {
    return (
      <img
        src={profile.avatarImageUrl}
        alt={`${profile.name} 프로필 사진`}
        onError={() => setImageFailed(true)}
        className="mx-auto size-[150px] shrink-0 rounded-full object-cover shadow-[0_10px_40px_-12px_rgba(99,102,241,0.6)]"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${profile.name} 프로필 사진 자리`}
      className="mx-auto flex size-[150px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-pink-500 text-[38px] font-bold text-white shadow-[0_10px_40px_-12px_rgba(99,102,241,0.6)]"
    >
      {profile.avatarInitials}
    </div>
  );
}
