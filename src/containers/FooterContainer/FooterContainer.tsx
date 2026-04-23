import { useTranslation } from 'react-i18next';
import DividerPrimary from '../../components/Divider/DividerPrimary';
import styles from './FooterContainer.module.css';

const FooterContainer = () => {
    const { t } = useTranslation();

    return (
        <footer className={styles.container}>
            <DividerPrimary />
            <p className={styles.copyright}>{t('footer.copyright')}</p>
        </footer>
    );
}

export default FooterContainer;
