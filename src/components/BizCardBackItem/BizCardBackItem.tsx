import { useRef, useState } from 'react';
import styles from './BizCardBackItem.module.css';
import PhoneIcon from '../../assets/phone.svg';
import GithubIcon from '../../assets/github.svg';
import LinkedInIcon from '../../assets/linkedin.svg';
import GlobeIcon from '../../assets/globe.svg';
import { type Tables } from '../../types/supabase';

interface BizCardBackItemProps {
    data: Tables<'guestbook'>;
}

const BizCardBackItem = ({ data }: BizCardBackItemProps) => {
    const cardRef = useRef<HTMLElement>(null);
    const [style, setStyle] = useState({});

    // 전화번호 파싱
    const formatPhone = (phone: string) => {
        if (!phone) return '';
        return phone
            .replace(/[^0-9]/g, '')
            .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = x / rect.width;
        const py = y / rect.height;

        const rotateX = (py - 0.5) * -30;
        const rotateY = (px - 0.5) * 30;

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
                <div className={styles.profile_section}>
                    <h1 className={styles.name}>{data.visitor_name}</h1>
                    
                    <div className={styles.info_section}>
                        <div className={styles.info_item}>
                            <img className={styles.info_label} src={PhoneIcon} alt="phone" />
                            <p className={styles.info_value}>{formatPhone(data.phone)}</p>
                        </div>

                        {data.github_url && (
                            <div className={styles.info_item}>
                                <img className={styles.info_label} src={GithubIcon} alt="github" />
                                <a className={styles.info_value} href={data.github_url} target="_blank" rel="noreferrer">
                                    {data.github_url}
                                </a>
                            </div>
                        )}

                        {data.linked_in_url && (
                            <div className={styles.info_item}>
                                <img className={styles.info_label} src={LinkedInIcon} alt="linkedin" />
                                <a className={styles.info_value} href={data.linked_in_url} target="_blank" rel="noreferrer">
                                    {data.linked_in_url}
                                </a>
                            </div>
                        )}

                        {data.blog_url && (
                            <div className={styles.info_item}>
                                <img className={styles.info_label} src={GlobeIcon} alt="globe" />
                                <a className={styles.info_value} href={data.blog_url} target="_blank" rel="noreferrer">
                                    {data.blog_url}
                                </a>
                            </div>
                        )}
                    </div>
                    
                    <hr className={styles.divider} />
                    <p className={styles.introduce}>{data.comment || "안녕하세요."}</p>
                </div>
            </article>
        </div>
    );
};

export default BizCardBackItem;