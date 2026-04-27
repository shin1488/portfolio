import { useTranslation } from 'react-i18next';
import styles from './Loading.module.css';

interface LoadingProps {
    /** 컴포넌트 영역에 맞춰 사용할 때 minHeight 제어 */
    fullScreen?: boolean;
    /** 메시지를 직접 지정하고 싶을 때 (기본값: common.loading) */
    message?: string;
}

const Loading = ({ fullScreen = true, message }: LoadingProps) => {
    const { t } = useTranslation();

    return (
        <div className={`${styles.container} ${fullScreen ? styles.full_screen : ''}`}>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.message}>{message ?? t('common.loading')}</p>
        </div>
    );
};

export default Loading;
