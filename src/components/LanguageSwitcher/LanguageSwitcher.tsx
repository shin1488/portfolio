import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import { LANG_PREFERENCE_KEY } from '../../i18n/useAutoLanguageRedirect';
import type { Lang } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentLang = useLang();

  const switchTo = (lang: Lang) => {
    // Remember explicit user choice so auto-detect won't override it next visit
    localStorage.setItem(LANG_PREFERENCE_KEY, lang);

    // Strip any existing /jp prefix to get the base path
    const base = pathname.replace(/^\/jp(?=\/|$)/, '') || '/';
    const next = lang === 'jp' ? (base === '/' ? '/jp' : `/jp${base}`) : base;
    navigate(next);
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.globe} aria-hidden="true">🌐</span>
      <select
        className={styles.select}
        value={currentLang}
        onChange={(e) => switchTo(e.target.value as Lang)}
        aria-label="Language"
      >
        <option value="ko">KR</option>
        <option value="jp">JP</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
