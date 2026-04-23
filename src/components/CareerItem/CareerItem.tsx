import StarIcon from '../../assets/4pointstar.svg';
import { useLocalize, type Localized } from '../../i18n/useLang';
import styles from './CareerItem.module.css';

interface Props {
    name: Localized;
    date: Localized;
    description: Localized | null;
}

const CareerItem = ({ name, date, description }: Props) => {
    const localize = useLocalize();
    return (
        <div className={styles.container}>
            <div className={styles.date_section}>
                <img src={StarIcon} className={styles.icon} />
                <p className={styles.date}>{localize(date)}</p>
            </div>
            <div className={styles.info_section}>
                <p className={styles.name}>{localize(name)}</p>
                <p className={styles.description}>{localize(description)}</p>
            </div>
        </div>
    );
}

export default CareerItem;
