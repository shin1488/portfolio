import styles from "./Header.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "../../i18n/useLang";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const lp = useLocalizedPath();

  return (
    <header className={styles.header}>
      <Link to={lp("/")} className={styles.title_section}>
        <p className={styles.title}>{t("header.title")}</p>
      </Link>
      <div className={styles.nav_section}>
        <Link to={lp("/")} className={styles.nav_item}>
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
