import { useLocation } from "react-router-dom";
import type { Lang } from "./index";

/** `{ ko: "...", jp: "..." }` 형태로 언어별 값을 보관하거나, 공통 문자열이면 그냥 string. */
export type Localized = string | { ko: string; jp: string };

/**
 * Returns the current language derived from the URL pathname.
 * `/jp/...` → 'jp', everything else → 'ko'
 */
export const useLang = (): Lang => {
  const { pathname } = useLocation();
  return pathname === "/jp" || pathname.startsWith("/jp/") ? "jp" : "ko";
};

/**
 * Returns a function that resolves a Localized value to the current language.
 * - plain string → 반환 그대로
 * - `{ ko, jp }` → 현재 언어에 맞는 값 반환
 * - null/undefined → null
 */
export const useLocalize = () => {
  const lang = useLang();
  return (value: Localized | null | undefined): string | null => {
    if (value == null) return null;
    return typeof value === "string" ? value : value[lang];
  };
};

/**
 * Returns a function that prefixes a given app-relative path with the current
 * language prefix (`/jp` for Japanese, no prefix for Korean).
 */
export const useLocalizedPath = () => {
  const lang = useLang();
  return (path: string): string => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (lang === "jp") {
      return normalized === "/" ? "/jp" : `/jp${normalized}`;
    }
    return normalized;
  };
};

/**
 * DB row에서 현재 언어에 맞는 필드를 선택한다.
 * 일본어 모드에서 `${field}_jp` 값이 있으면 그것을, 없으면 `field`(한국어)로 fallback.
 *
 * @example
 *   const lf = useLocalizedField();
 *   const title = lf<string>(project, 'title');
 */
export const useLocalizedField = () => {
  const lang = useLang();
  return <T = string>(row: any, field: string): T | undefined => {
    if (row == null) return undefined;
    if (lang === "jp") {
      const jpValue = row[`${field}_jp`];
      if (jpValue != null && jpValue !== "") return jpValue as T;
    }
    return row[field] as T;
  };
};
