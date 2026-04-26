import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const LANG_PREFERENCE_KEY = 'preferredLang';

/**
 * On first app load, redirects Japanese-browser users from Korean paths to /jp.
 * - If the user has an explicit preference saved (set by LanguageSwitcher),
 *   skip auto-detection entirely.
 * - If they're already on a /jp path, leave them alone.
 * - Runs only once per mount.
 */
export const useAutoLanguageRedirect = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        // 1. 사용자가 직접 선택한 적 있으면 자동 감지 안 함
        const stored = localStorage.getItem(LANG_PREFERENCE_KEY);
        if (stored) return;

        // 2. 이미 JP 경로면 그대로
        const isAtJpPath = pathname === '/jp' || pathname.startsWith('/jp/');
        if (isAtJpPath) return;

        // 3. 브라우저 언어가 일본어면 /jp로 redirect
        const browserLang = navigator.language.toLowerCase();
        const isJapaneseBrowser = browserLang.startsWith('ja');
        if (isJapaneseBrowser) {
            const target = pathname === '/' ? '/jp' : `/jp${pathname}`;
            navigate(target, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
