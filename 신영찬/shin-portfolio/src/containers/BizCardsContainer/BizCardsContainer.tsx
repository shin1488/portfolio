import BizCardContainer from '../BizCardContainer/BizCardContainer';
import styles from './BizCardsContainer.module.css';

const BizCardsContainer = () => {
    return (
        <div className={styles.container}>
            <BizCardContainer />
            <BizCardContainer />
            <BizCardContainer />
            <BizCardContainer />
            <BizCardContainer />
            <BizCardContainer />
            <BizCardContainer />
            <BizCardContainer />
            <BizCardContainer />
        </div>
    );
}

export default BizCardsContainer;