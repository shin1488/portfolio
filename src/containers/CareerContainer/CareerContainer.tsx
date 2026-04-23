import CareerItem from '../../components/CareerItem/CareerItem';
import type { CareerItemData } from '../../data/careers';
import styles from './CareerContainer.module.css';

interface Props {
    items: CareerItemData[];
}

const CareerContainer = ({ items }: Props) => (
    <div className={styles.container}>
        {items.map((item, idx) => (
            <CareerItem
                key={idx}
                name={item.name}
                date={item.date}
                description={item.description}
            />
        ))}
    </div>
);

export default CareerContainer;
