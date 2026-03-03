import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className={styles.header}>
            <Link to="/" className={styles.title_section}>
                <img className={styles.logo} src={logo}></img>
                <p className={styles.title}>신영찬의 포트폴리오</p>
            </Link>
            <div className={styles.nav_section}>
                <Link to="/" className={styles.nav_item}>Home</Link>
                <Link to="/projects" className={styles.nav_item}>Projects</Link>
                <Link to="/posts" className={styles.nav_item}>Blog</Link>
                <Link to="/guestbook" className={styles.nav_item}>GuestBook</Link>
            </div>
        </header>
    );
}

export default Header;