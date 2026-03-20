import styles from './Profile.module.css';
import profileImage from '../../assets/profile_image.jpg';

const Profile = () => {
    return (
        <div className={styles.profile_container}>
            <img className={styles.profile_image} src={profileImage} />
            <div className={styles.introduce_section}>
                <h1 className={styles.name}>신영찬</h1>
                <p className={styles.job}>Android Developer</p>
                <div className={styles.info}>
                    <p>Birth: 1998-06-25</p>
                    <p>Contact: 010-3144-1488</p>
                    <p>Email: syc1488@naver.com</p>
                </div>
            </div>
        </div>
    );
}

export default Profile;