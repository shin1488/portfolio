import BizCardItem from '../../components/BizCardItem/BizCardItem';
import BizCardBackItem from '../../components/BizCardBackItem/BizCardBackItem';
import styles from './BizCardContainer.module.css';
import { type Tables } from '../../types/supabase';

const BizCardContainer = ({ data }: { data: Tables<'guestbook'> }) => {
    return(
        <div className={styles.container}>
            <BizCardItem data={data} />
            <BizCardBackItem data={data} />
        </div>
    );
}

export default BizCardContainer;