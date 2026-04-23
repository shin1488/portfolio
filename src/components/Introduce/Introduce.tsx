import { useTranslation } from 'react-i18next';
import styles from './Introduce.module.css';

const Introduce = () => {
    const { t } = useTranslation();
    const items = t('introduce.items', { returnObjects: true }) as string[];

    return (
        <div className={styles.introduce_section}>
            <p className={styles.subtitle}>{t('introduce.subtitle')}</p>
            <div className={styles.what_can_i_do}>
                {items.map((text, idx) => (
                    <p key={idx}>● {text}</p>
                ))}
            </div>
        </div>
    );
}

export default Introduce;
