import type { Root, Element, Text } from 'hast';

/**
 * rehype-psr — 마크다운 본문의 "문제 · 해결 · 결과" 3줄 불릿을 자동 감지해
 * 연결된 타임라인(스텝) 구조로 바꾸기 위한 전처리 플러그인.
 *
 * 저자는 md를 지금처럼 평범한 불릿으로 쓰면 된다(다시 쓸 필요 없음):
 *
 *   - **문제** — 현재고는 이동 원장의 파생값 …
 *   - **해결** — 조건부 원자적 UPDATE …
 *   - **결과** — TOCTOU·이중 반영을 구조적으로 차단 …
 *
 * 이 플러그인은 위 <ul>을 감지해 <div data-psr> + 각 항목 <div data-psr-kind="…">
 * 로 재작성한다(라벨 strong과 앞쪽 "— " 구분자는 제거). 실제 화면 렌더는
 * Markdown.tsx의 div 컴포넌트 오버라이드(PsrFlow/PsrStep)가 담당한다.
 *
 * 감지 규칙: <ul>의 모든 <li>가 <strong>문제|해결|결과</strong>(또는 영문
 * Problem|Solution|Result)로 시작할 때만 변환. 하나라도 어긋나면 일반 리스트로 둔다
 * (다른 굵은-라벨 불릿 리스트는 건드리지 않음).
 */

type Kind = 'problem' | 'solution' | 'result';

const KIND_BY_LABEL: Record<string, Kind> = {
  문제: 'problem',
  해결: 'solution',
  결과: 'result',
  Problem: 'problem',
  Solution: 'solution',
  Result: 'result',
};

function textOf(node: unknown): string {
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (!n) return '';
  if (n.type === 'text') return n.value ?? '';
  if (Array.isArray(n.children)) return n.children.map(textOf).join('');
  return '';
}

export default function rehypePsr() {
  return (tree: Root) => walk(tree as unknown as Element);
}

function walk(node: Element): void {
  if (!node || !Array.isArray(node.children)) return;
  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'ul') transform(child);
    if (child.type === 'element') walk(child);
  }
}

function transform(ul: Element): void {
  const items = ul.children.filter(
    (c): c is Element => c.type === 'element' && c.tagName === 'li',
  );
  if (items.length < 2 || items.length > 3) return;

  const kinds = items.map((li) => {
    const strong = li.children.find(
      (c) => c.type === 'element' && c.tagName === 'strong',
    ) as Element | undefined;
    return strong ? KIND_BY_LABEL[textOf(strong).trim()] : undefined;
  });
  if (kinds.some((k) => !k)) return; // 모든 항목이 P/S/R 라벨일 때만

  ul.tagName = 'div';
  ul.properties = { ...(ul.properties ?? {}), dataPsr: '' };
  items.forEach((li, i) => {
    const si = li.children.findIndex(
      (c) => c.type === 'element' && (c as Element).tagName === 'strong',
    );
    const rest = li.children.slice(si + 1);
    const first = rest[0] as Text | undefined;
    // 라벨 뒤 "— " / "–" / "-" / 공백 구분자 제거
    if (first && first.type === 'text') first.value = first.value.replace(/^[\s—–-]+/, '');
    li.tagName = 'div';
    li.properties = { ...(li.properties ?? {}), dataPsrKind: kinds[i] };
    li.children = rest;
  });
  ul.children = items; // 항목 사이 공백 텍스트노드 제거
}
