import { useTranslation } from 'react-i18next';
import styles from './Profile.module.css';
import profileImage from '../../assets/profile_image.jpg';

const Profile = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.profile_container}>
            <img className={styles.profile_image} src={profileImage} />
            <div className={styles.introduce_section}>
                <h1 className={styles.name}>{t('profile.name')}</h1>
                <p className={styles.job}>{t('profile.job')}</p>
                <div className={styles.info}>
                    <p>{t('profile.birthLabel')}: 1998-06-25</p>
                    <p>{t('profile.contactLabel')}: 010-3144-1488</p>
                    <p>{t('profile.emailLabel')}: syc1488@naver.com</p>
                </div>
            </div>
        </div>
    );
}

export default Profile;
