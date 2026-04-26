import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../i18n/useLang';
import styles from './NotFound.module.css';

const NotFound = () => {
    const { t } = useTranslation();
    const lp = useLocalizedPath();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t('notFound.title')}</h1>
            <p className={styles.message}>{t('notFound.message')}</p>
            <Link to={lp('/')} className={styles.home_link}>
                {t('notFound.goHome')}
            </Link>
        </div>
    );
};

export default NotFound;
