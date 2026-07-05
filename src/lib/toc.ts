import GithubSlugger from 'github-slugger';

export interface TocEntry {
  id: string;
  text: string;
}

/**
 * markdown 본문에서 최상위 섹션 제목(`# `)을 추출해 목차 항목으로 만든다.
 * id는 rehype-slug와 동일한 github-slugger로 생성하므로 렌더된 heading의 id와 일치한다.
 * rehype-slug가 모든 레벨의 heading을 순서대로 슬러깅하므로, 여기서도 모든 heading을
 * 순서대로 슬러거에 통과시켜 중복 처리 상태(dedupe 카운터)를 맞추되, `# ` 항목만 수집한다.
 * 코드블록(``` 펜스) 안의 `#`는 제외한다.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~|````)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6}) (.+?)\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, '').trim();
    const id = slugger.slug(text); // 모든 heading을 순서대로 슬러깅(상태 동기화)
    if (level === 1) entries.push({ id, text });
  }
  return entries;
}
