import DividerSecondary from '../../components/Divider/DividerSecondary';
import { CAREER_DATA } from '../../data/careers';
import CareerContainer from '../CareerContainer/CareerContainer';
import styles from './CareersContainer.module.css';

const CareersContainer = () => {
    const leftColumn = CAREER_DATA.filter(({ category }) => category !== "수상 및 자격증");
    const rightColumn = CAREER_DATA.filter(({ category }) => category === "수상 및 자격증");

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Careers</h1>
            <div className={styles.content_wrapper}>
                <div className={styles.left_column}>
                    {leftColumn.map(({ category, items }) => (
                        <div className={styles.child_container} key={category}>
                            <div className={styles.divider_section}>
                                <DividerSecondary />
                                <p className={styles.category}>{category}</p>
                            </div>
                            <CareerContainer items={items} />
                        </div>
                    ))}
                </div>
                <div className={styles.right_column}>
                    {rightColumn.map(({ category, items }) => (
                        <div className={styles.child_container} key={category}>
                            <div className={styles.divider_section}>
                                <DividerSecondary />
                                <p className={styles.category}>{category}</p>
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