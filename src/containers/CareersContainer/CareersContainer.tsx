import DividerSecondary from '../../components/Divider/DividerSecondary';
import { CAREER_DATA } from '../../data/careers';
import CareerContainer from '../CareerContainer/CareerContainer';
import { useLocalize } from '../../i18n/useLang';
import styles from './CareersContainer.module.css';

const CareersContainer = () => {
    const localize = useLocalize();
    const leftColumn = CAREER_DATA.filter(({ id }) => id !== 'awards');
    const rightColumn = CAREER_DATA.filter(({ id }) => id === 'awards');

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Careers</h1>
            <div className={styles.content_wrapper}>
                <div className={styles.left_column}>
                    {leftColumn.map(({ id, category, items }) => (
                        <div className={styles.child_container} key={id}>
                            <div className={styles.divider_section}>
                                <DividerSecondary />
                                <p className={styles.category}>{localize(category)}</p>
                            </div>
                            <CareerContainer items={items} />
                        </div>
                    ))}
                </div>
                <div className={styles.right_column}>
                    {rightColumn.map(({ id, category, items }) => (
                        <div className={styles.child_container} key={id}>
                            <div className={styles.divider_section}>
                                <DividerSecondary />
                                <p className={styles.category}>{localize(category)}</p>
                            </div>
                            <CareerContainer items={items} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CareersContainer;
