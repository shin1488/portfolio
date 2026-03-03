import BizCardsContainer from '../../containers/BizCardsContainer/BizCardsContainer';
import styles from './GuestBook.module.css';

const GuestBook = () => {
    return (
        <div className={styles.guestbook}>
            <BizCardsContainer />
        </div>
    );
}

export default GuestBook;