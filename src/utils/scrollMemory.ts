// 페이지별 스크롤 위치를 sessionStorage에 임시 보관해서, 뒤로가기 등으로 다시 진입할 때 복원할 수 있게 함.
const PREFIX = "scroll:";

export const getScrollMemory = (key: string): number | null => {
  try {
    const v = sessionStorage.getItem(PREFIX + key);
    return v === null ? null : parseInt(v, 10);
  } catch {
    return null;
  }
};

export const saveScrollMemory = (key: string, y: number) => {
  try {
    sessionStorage.setItem(PREFIX + key, String(y));
  } catch {
    // sessionStorage 비활성/quota 초과 시 무시
  }
};

export const clearScrollMemory = (key: string) => {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
};
