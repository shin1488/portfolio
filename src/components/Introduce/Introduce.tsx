import { useTranslation } from 'react-i18next';
import styles from './Introduce.module.css';

type Section = {
    subtitle: string;
    items: string[];
};

const Introduce = () => {
    const { t } = useTranslation();
    const sections = t('introduce.sections', { returnObjects: true }) as Section[];

    return (
        <div className={styles.introduce_section}>
            {sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className={styles.section}>
                    <p className={styles.subtitle}>{section.subtitle}</p>
                    <div className={styles.what_can_i_do}>
                        {section.items.map((text, idx) => (
                            <p key={idx}>● {text}</p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Introduce;
