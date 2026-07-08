/**
 * highlights 불릿 텍스트 — '주제 — 내용' 규격의 주제만 볼드·밝은 색으로 분리해
 * 스캔이 되게 렌더한다(대시가 없는 불릿은 평문 그대로). 홈 카드·상세 헤더 공용.
 */
export function HighlightText({ text }: { text: string }) {
  const dashIdx = text.indexOf(' — ');
  if (dashIdx <= 0) {
    return <>{text}</>;
  }
  return (
    <>
      <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
        {text.slice(0, dashIdx)}
      </strong>
      {' — '}
      {text.slice(dashIdx + 3)}
    </>
  );
}
