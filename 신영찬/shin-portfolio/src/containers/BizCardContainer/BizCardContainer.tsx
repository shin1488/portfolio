import BizCardItem from '../../components/BizCardItem/BizCardItem';
import BizCardBackItem from '../../components/BizCardBackItem/BizCardBackItem';
import styles from './BizCardContainer.module.css';

const BizCardContainer = () => {
    return(
        <div className={styles.container}>
            <BizCardItem />
            <BizCardBackItem />
        </div>
    );
}

export default BizCardContainer;