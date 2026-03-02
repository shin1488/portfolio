import DividerPrimary from '../../components/Divider/DividerPrimary';
import Header from '../../components/Header/Header';
import styles from './HeaderContainer.module.css';

const HeaderContainer = () => {
    return (
        <header className={styles.container}>
            <Header />
            <DividerPrimary />
        </header>
    );
}

export default HeaderContainer;