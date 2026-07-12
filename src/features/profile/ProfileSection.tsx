import { useEffect, useState, type Ref } from 'react';
import { Frame } from '@/components/layout/Frame';
import { cn } from '@/lib/cn';
import type { Profile } from '@/types/content';

interface ProfileSectionProps {
  profile: Profile;
  /** 라우트 전환 시 페이지 제목으로 포커스를 옮기기 위한 ref */
  headingRef?: Ref<HTMLHeadingElement>;
}

/**
 * 첫 등장 연출의 단계 — 글로우 셋이 좌상단 → 우하단 → 좌하단 순으로 켜지고,
 * 이어서 좌측 텍스트가 역할 → 이름 → 소개 → 위치 순으로 탁탁 올라온다.
 * 마지막 단계에서 프로필 사진이 함께 뜬다.
 */
const GLOW_GREEN = 1;
const GLOW_BLUE = 2;
const GLOW_ROSE = 3;
const ROLE = 4;
const NAME = 5;
const TAGLINE = 6;
const LOCATION = 7; // 프로필 사진도 이 단계에서 함께
const LAST = LOCATION;
/** 단계 간격(ms) — 지루하지 않게 아주 빠르게 지나간다(총 ~500ms) */
const STEP_MS = 75;

/**
 * 연출은 문서를 새로 연 첫 렌더에서만 한다. 모듈 스코프 플래그라 SPA 안에서 홈으로 되돌아올 때는
 * (상세 → 뒤로가기 등) 다시 재생되지 않고, 새로고침·새 창 진입에서는 다시 재생된다.
 */
let introPlayed = false;

/** 히어로 — 프레임 안 좌측 정렬 인트로. 액센트 3색 글로우가 모서리에서 번진다. */
export function ProfileSection({ profile, headingRef }: ProfileSectionProps) {
  const [step, setStep] = useState(introPlayed ? LAST : 0);

  useEffect(() => {
    // 이미 재생한 뒤의 재마운트(SPA 안에서 홈 복귀)라면 곧바로 전부 보인다.
    if (introPlayed) {
      setStep(LAST);
      return;
    }
    // 동작 줄이기 설정이면 연출 없이 즉시 전부 보인다.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      introPlayed = true;
      setStep(LAST);
      return;
    }
    const timers = Array.from({ length: LAST }, (_, i) =>
      window.setTimeout(() => setStep(i + 1), (i + 1) * STEP_MS),
    );
    // '재생 완료' 표시는 연출이 끝난 뒤에 세운다. effect 진입 시점에 세우면, StrictMode가 개발
    // 모드에서 effect를 mount → cleanup → mount로 두 번 돌릴 때 두 번째 실행이 "이미 재생함"으로
    // 판정해 곧장 빠져나가고, 첫 실행의 타이머는 cleanup에서 지워져 화면에 아무것도 안 뜬다.
    const done = window.setTimeout(
      () => {
        introPlayed = true;
      },
      LAST * STEP_MS + 400,
    );
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, []);

  const shown = (at: number) => step >= at;
  /** 텍스트 한 덩어리 — 아래에서 살짝 올라오며 뜬다 */
  const rise = (at: number) =>
    cn(
      'transition-[opacity,transform] duration-300 ease-out',
      shown(at) ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
    );

  return (
    <section id="profile" aria-label="Profile" className="scroll-mt-11">
      {/* 헤더(44px)를 뺀 첫 화면을 히어로가 채운다 */}
      <Frame className="relative flex min-h-[calc(100svh-2.75rem-env(safe-area-inset-top))] flex-col justify-center overflow-hidden">
        {/* 액센트 글로우 — 좌상단 그린, 우하단 블루, 좌하단 로즈. 크기를 비대칭으로 둬(그린이 가장
            크고 로즈가 가장 작다) 그린이 전체 톤을 잡게 한다. 꼬리를 길게 끄는 중간 정지점을 둬
            겹치는 구간에서 색이 섞이며 넘어가게 했다(정지점 없이 바로 transparent로 빼면 각자
            자기 모서리에서 사그라들어 서로 만나지 못한다). 색은 color-mix로 @theme 토큰을 직접
            끌어와, 토큰을 바꾸면 글로우도 따라온다.
            프레임 밖으로 새지 않도록 Frame이 overflow-hidden으로 잘라낸다. */}
        <Glow
          on={shown(GLOW_GREEN)}
          image="radial-gradient(125% 115% at -6% -8%, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, color-mix(in srgb, var(--color-accent) 16%, transparent) 45%, transparent 88%)"
        />
        <Glow
          on={shown(GLOW_BLUE)}
          image="radial-gradient(80% 88% at 106% 108%, color-mix(in srgb, var(--color-accent-end) 48%, transparent) 0%, color-mix(in srgb, var(--color-accent-end) 18%, transparent) 45%, transparent 88%)"
        />
        <Glow
          on={shown(GLOW_ROSE)}
          image="radial-gradient(52% 58% at -4% 106%, color-mix(in srgb, var(--color-accent-rose) 34%, transparent) 0%, color-mix(in srgb, var(--color-accent-rose) 12%, transparent) 45%, transparent 82%)"
        />

        {/* 좌측 여백은 다른 섹션(px-8)보다 넉넉하게 — 초대형 이름이 프레임 선에 붙지 않게 한다.
            사진은 텍스트 블록과 세로 중앙을 맞춘다. */}
        <div className="relative grid gap-12 px-6 py-24 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-16 md:px-16">
          <div>
            {/* 역할 — 로고 호버와 같은 그라데이션이 상시 흐른다(breathing) */}
            <p
              className={cn(
                'w-fit animate-[logo-flow_4s_linear_infinite] bg-linear-to-r from-accent via-accent-end to-accent bg-size-[200%_auto] bg-clip-text text-[15px] font-bold tracking-tight text-transparent md:text-lg',
                rise(ROLE),
              )}
            >
              {profile.role}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className={cn(
                'mt-4 text-[64px] font-bold leading-[1.02] tracking-[-0.05em] text-zinc-100 outline-none sm:text-[96px] lg:text-[124px]',
                rise(NAME),
              )}
            >
              {profile.name}
            </h1>
            {/* 쉼표에서 줄바꿈 — 어색한 중간 지점 대신 문장 호흡 단위로 끊는다 */}
            <p
              className={cn(
                'mt-6 max-w-xl text-[15px] leading-[1.75] text-zinc-400 md:text-lg',
                rise(TAGLINE),
              )}
            >
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
              <p className={cn('mt-9 text-[11px] text-zinc-500', rise(LOCATION))}>
                {profile.location}
              </p>
            )}
          </div>

          {/* 사진은 마지막 텍스트와 함께 뜬다 */}
          <div className={rise(LOCATION)}>
            <Avatar profile={profile} />
          </div>
        </div>

        {/* 스크롤 힌트 — 하단 중앙은 연락처 독이 차지하므로 우측 하단 모서리에 둔다.
            글로우 위에 얹히므로 배경과 묻히지 않게 밝기를 올리고 화살표를 키웠다. */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-6 right-5 flex items-center gap-2.5 text-zinc-300 md:right-8',
            rise(LAST),
          )}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Scroll</span>
          <span className="scroll-hint-arrow text-[19px] leading-none text-accent">↓</span>
        </div>
      </Frame>
    </section>
  );
}

/** 히어로 모서리 글로우 한 겹 — 켜질 때 서서히 번진다 */
function Glow({ on, image }: { on: boolean; image: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out',
        on ? 'opacity-100' : 'opacity-0',
      )}
      style={{ backgroundImage: image }}
    />
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
      className={`${box} flex items-center justify-center bg-zinc-900 text-2xl font-bold text-accent`}
    >
      {profile.avatarInitials}
    </div>
  );
}
