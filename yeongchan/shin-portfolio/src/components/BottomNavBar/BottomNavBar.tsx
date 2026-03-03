import styles from './BottomNavBar.module.css';

const BottomNavBar = () => {
    return (
        <div className={styles.nav_container}>
            <a href="mailto:shin1488dev@gmail.com">Email</a>
            <a href="https://github.com/shin1488" target='_blank'>Github</a>
            <a href="https://www.linkedin.com/in/영찬-신-9aa85b3b3" target='_blank'>LinkedIn</a>
        </div>
    );
}

export default BottomNavBar;