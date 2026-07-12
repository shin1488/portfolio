/** 한글 초성 19자 — 유니코드 조합형 음절의 초성 인덱스 순서 그대로다. */
const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const JUNG_COUNT = 21;
const JONG_COUNT = 28;

/**
 * 문장을 '타이핑 프레임' 배열로 편다 — 프레임 i는 i+1번째 입력까지 친 상태의 문자열이다.
 *
 * 한글은 글자 단위로 툭 튀어나오지 않고 실제로 자판을 치듯 조합된다:
 * '안' → 'ㅇ' → '아' → '안'. 유니코드 조합형 음절(가~힣)은 (초성, 중성, 종성)으로 분해할 수 있으므로,
 * 초성만 → 초성+중성 → 초성+중성+종성 순으로 프레임을 만든다. 종성이 없으면 두 프레임이다.
 * 한글이 아닌 글자(영문·숫자·기호·공백)는 한 프레임에 하나씩 찍힌다.
 */
export function typingFrames(text: string): string[] {
  const frames: string[] = [];
  let done = ''; // 이미 완성된 앞부분

  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      const index = code - HANGUL_BASE;
      const cho = Math.floor(index / (JUNG_COUNT * JONG_COUNT));
      const jung = Math.floor((index % (JUNG_COUNT * JONG_COUNT)) / JONG_COUNT);
      const jong = index % JONG_COUNT;

      frames.push(done + CHOSEONG[cho]); // ㅇ
      frames.push(done + String.fromCharCode(HANGUL_BASE + (cho * JUNG_COUNT + jung) * JONG_COUNT)); // 아
      if (jong > 0) frames.push(done + ch); // 안
    } else {
      frames.push(done + ch);
    }
    done += ch;
  }
  return frames;
}
