import StarIcon from '../../assets/4pointstar.svg';
import styles from './CareerItem.module.css';

const CareerItem = ({ name, date, description }: any) => {
    return (
        <div className={styles.container}>
            <div className={styles.date_section}>
                <img src={StarIcon} className={styles.icon} />
                <p className={styles.date}>{date}</p>
            </div>
            <div className={styles.info_section}>
                <p className={styles.name}>{name}</p>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
    );
}

export default CareerItem;