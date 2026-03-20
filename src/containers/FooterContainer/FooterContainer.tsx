import DividerPrimary from '../../components/Divider/DividerPrimary';
import styles from './FooterContainer.module.css';

const FooterContainer = () => {
    return (
        <footer className={styles.container}>
            <DividerPrimary />
            <p className={styles.copyright}>©Copyright 2026. 신영찬 all rights reserved.</p>
        </footer>
    );
}

export default FooterContainer;