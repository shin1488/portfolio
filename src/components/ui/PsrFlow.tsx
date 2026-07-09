import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * 문제 · 해결 · 결과 아이콘 타임라인 렌더러 (3번 + 7번 결합).
 * rehype-psr 가 <ul>을 <div data-psr>(컨테이너) + <div data-psr-kind>(각 스텝)으로
 * 바꿔 두면, Markdown.tsx 의 div 오버라이드가 이 두 컴포넌트로 렌더한다.
 *
 * 시각: 왼쪽에 아이콘 뱃지(⚠ 문제 / ⚙ 해결 / ✓ 결과) + 다음 스텝으로 이어지는
 * 세로 그라데이션 선, 오른쪽에 라벨 + 본문. 문제=rose, 해결=indigo, 결과=emerald.
 * 결과 본문만 살짝 밝게/굵게(도착점 강조). not-prose 로 본문 prose와 충돌 방지.
 */

export type PsrKind = 'problem' | 'solution' | 'result';

const PSR: Record<
  PsrKind,
  { label: string; dot: string; labelClass: string; tint: string; icon: ReactNode }
> = {
  problem: {
    label: '문제',
    dot: '#fb7185', // rose-400 (dot·연결선)
    labelClass: 'text-rose-400',
    tint: 'bg-rose-400/12',
    icon: (
      <path
        d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  solution: {
    label: '해결',
    dot: '#818cf8', // indigo-400
    labelClass: 'text-indigo-300',
    tint: 'bg-indigo-500/12',
    icon: (
      <>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  result: {
    label: '결과',
    dot: '#6ee7b7', // emerald-300
    labelClass: 'text-emerald-300',
    tint: 'bg-emerald-400/12',
    icon: <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />,
  },
};

interface PsrStepProps {
  kind: PsrKind;
  isLast?: boolean;
  lineTo?: string;
  children?: ReactNode;
}

export function PsrFlow({ children }: { children?: ReactNode }) {
  // react-markdown 경유 시 children은 PsrStep이 아니라 각 스텝을 감싼 div 오버라이드
  // 엘리먼트다(react-markdown이 node를 props로 넘긴다). 그래서 kind는 자식 엘리먼트의
  // node(hast) 속성에서 읽고, 여기서 PsrStep을 직접 렌더하며 순서 정보(마지막 여부 isLast·
  // 다음 스텝 색 lineTo)를 주입한다 — 이래야 마지막 스텝엔 선이 없고 선이 다음 색으로 그라데이션 진다.
  const steps = Children.toArray(children).filter(isValidElement) as ReactElement<{
    node?: { properties?: Record<string, unknown> };
    children?: ReactNode;
  }>[];
  const kinds = steps.map((s) => s.props?.node?.properties?.dataPsrKind as PsrKind | undefined);
  return (
    <div className="psr not-prose my-7 flex flex-col">
      {steps.map((step, i) => {
        const kind = kinds[i];
        if (!kind) return step;
        const next = kinds[i + 1];
        return (
          <PsrStep key={i} kind={kind} isLast={i === steps.length - 1} lineTo={next ? PSR[next].dot : undefined}>
            {step.props.children}
          </PsrStep>
        );
      })}
    </div>
  );
}

export function PsrStep({ kind, isLast, lineTo, children }: PsrStepProps) {
  const c = PSR[kind];
  return (
    <div className="grid grid-cols-[34px_1fr] gap-x-4">
      {/* 아이콘 뱃지 + 연결선 */}
      <div className="flex flex-col items-center" aria-hidden="true">
        <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] ${c.tint}`}>
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke={c.dot} strokeWidth={kind === 'result' ? 2.4 : 2.2}>
            {c.icon}
          </svg>
        </span>
        {/* 중간 스텝: 다음 스텝 색으로 이어지는 그라데이션(다음 아이콘까지 연결).
            마지막 스텝: 다음이 없으므로 자기 색 단색으로 본문 높이까지 채운다 — 다른 선과
            같은 불투명 규칙이라 일관되고, 좌측 레일이 본문 끝까지 닿아 스텝 내용을 마감한다.
            minHeight는 마지막 스텝에선 0 — 본문이 아이콘보다 짧으면 선이 삐져나오지 않게. */}
        <span
          className="w-0.5 flex-1"
          style={{
            minHeight: isLast ? 0 : 14,
            background: isLast ? c.dot : `linear-gradient(${c.dot}, ${lineTo ?? c.dot})`,
          }}
        />
      </div>
      {/* 라벨 + 본문. 라벨은 leading-8(=뱃지 높이 32px)로 줄박스를 잡아, 텍스트가 아이콘
          뱃지의 세로 중앙과 같은 높이에 오게 한다(둘 다 행 상단에서 시작하는 32px 블록). */}
      <div className={isLast ? undefined : 'pb-5'}>
        <span className={`text-[20px] font-bold leading-8 ${c.labelClass}`}>{c.label}</span>
        <div
          className={`mt-1 text-[15px] leading-[1.7] ${
            kind === 'result' ? 'font-medium text-zinc-100' : 'text-zinc-300'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
