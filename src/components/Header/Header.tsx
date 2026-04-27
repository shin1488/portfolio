import styles from "./Header.module.css";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "../../i18n/useLang";
import { clearScrollMemory } from "../../utils/scrollMemory";
import { HOME_SCROLL_KEY } from "../../pages/Home/Home";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const location = useLocation();

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 로고/Home 클릭 시엔 저장된 홈 스크롤 위치를 비워, 새로 진입할 때 항상 최상단으로 보이도록 함
    clearScrollMemory(HOME_SCROLL_KEY);

    // 이미 홈에 있을 땐 react-router의 navigation이 일어나지 않으므로, 직접 스크롤을 끌어올림
    if (location.pathname === lp("/")) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className={styles.header}>
      <Link
        to={lp("/")}
        className={styles.title_section}
        onClick={handleHomeClick}
      >
        <p className={styles.title}>{t("header.title")}</p>
      </Link>
      <div className={styles.nav_section}>
        <Link
          to={lp("/")}
          className={styles.nav_item}
          onClick={handleHomeClick}
        >
          {t("header.home")}
        </Link>
        <Link to={lp("/projects")} className={styles.nav_item}>
          {t("header.projects")}
        </Link>
        <Link to={lp("/posts")} className={styles.nav_item}>
          {t("header.blog")}
        </Link>
        <Link to={lp("/guestbook")} className={styles.nav_item}>
          {t("header.guestbook")}
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
