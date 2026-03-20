import styles from './BizCardsContainer.module.css';
import { useEffect, useState } from 'react';
import { getVisibleGuestbooks } from '../../api/getGuestbook';
import type { Tables } from '../../types/supabase';
import BizCardContainer from '../BizCardContainer/BizCardContainer';
import { Link } from 'react-router-dom';

const BizCardsContainer = () => {
    const [entries, setEntries] = useState<Tables<'guestbook'>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const data = await getVisibleGuestbooks();
                setEntries(data);
            } catch (err) {
                console.error('로드 실패:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>GuestBook</h1>
            <div className={styles.card_section}>
                {entries.map((entry) => (
                    <BizCardContainer key={entry.id} data={entry} />
                ))}
            </div>

            <Link to="/guestbook/write" className={styles.floating_button}>+</Link>
        </div>
    );
};

export default BizCardsContainer;