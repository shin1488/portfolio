import { useLocation } from 'react-router-dom';
import type { Lang } from './index';

/**
 * Returns the current language derived from the URL pathname.
 * `/jp/...` → 'jp', everything else → 'ko'
 */
export const useLang = (): Lang => {
  const { pathname } = useLocation();
  return pathname === '/jp' || pathname.startsWith('/jp/') ? 'jp' : 'ko';
};

/**
 * Returns a function that prefixes a given app-relative path with the current
 * language prefix (`/jp` for Japanese, no prefix for Korean).
 *
 * Usage:
 *   const lp = useLocalizedPath();
 *   <Link to={lp('/projects')} />
 */
export const useLocalizedPath = () => {
  const lang = useLang();
  return (path: string): string => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (lang === 'jp') {
      return normalized === '/' ? '/jp' : `/jp${normalized}`;
    }
    return normalized;
  };
};
