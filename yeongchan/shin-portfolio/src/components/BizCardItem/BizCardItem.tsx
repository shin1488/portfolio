import { useRef, useState } from 'react';
import styles from './BizCardItem.module.css';
import { type Tables } from '../../types/supabase';
import logo from '../../assets/logo.png'

const BizCardItem = ({ data }: { data: Tables<'guestbook'> }) => {
    const cardRef = useRef<HTMLElement>(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();

        // 카드 내 마우스 좌표 상대값 (0 ~ 1)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = x / rect.width;
        const py = y / rect.height;

        // 기울기 계산 (-15도 ~ 15도 사이로 회전)
        const rotateX = (py - 0.5) * -30;
        const rotateY = (px - 0.5) * 30;

        // CSS 변수로 전달
        setStyle({
            '--px': `${px * 100}%`,
            '--py': `${py * 100}%`,
            '--rx': `${rotateX}deg`,
            '--ry': `${rotateY}deg`,
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            '--px': '50%',
            '--py': '50%',
            '--rx': '0deg',
            '--ry': '0deg',
        });
    };

    return (
        <div className={styles.wrapper}>
            <article
                ref={cardRef}
                className={styles.container}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={style}
            >
                <figure className={styles.image_wrapper}>
                    <img
                        className={styles.profile_image}
                        src={data.profile_img || logo}
                        alt={data.visitor_name}
                    />
                    <div className={styles.foil_effect}></div>
                    <div className={styles.glare_effect}></div>
                </figure>

                <div className={styles.profile_section}>
                    <h2 className={styles.name}>{data.visitor_name}</h2>
                    <hr className={styles.divider} />
                    <div className={styles.info_section}>
                        <div className={styles.info_item}>
                            <p className={styles.info_label}>경력</p>
                            <p className={styles.info_value}>{data.experience}년</p>
                        </div>
                        <div className={styles.info_item}>
                            <p className={styles.info_label}>직무</p>
                            <p className={styles.info_value}>{data.main_stack}</p>
                        </div>
                        <div className={styles.info_item}>
                            <p className={styles.info_label}>MBTI</p>
                            <p className={styles.info_value}>{data.mbti}</p>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

export default BizCardItem;