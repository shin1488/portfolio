import Introduce from '../../components/Introduce/Introduce';
import Profile from '../../components/Profile/Profile';
import styles from './IntroduceContainer.module.css';

const IntroduceContainer = () => {
    return (
        <div className={styles.container}>
            <Profile />
            <Introduce />
        </div>
    );
}

export default IntroduceContainer;