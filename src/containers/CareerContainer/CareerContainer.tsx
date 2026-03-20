import CareerItem from '../../components/CareerItem/CareerItem';
import styles from './CareerContainer.module.css';

const CareerContainer = ({ items }: any) => (
    <div className={styles.container}>
        {items.map((item: any) => (
            <CareerItem
                key={item.name}
                name={item.name}
                date={item.date}
                description={item.description}
            />
        ))}
    </div>
)

export default CareerContainer;