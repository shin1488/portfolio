import { Link } from 'react-router-dom';
import { useLocalizedPath } from '../../i18n/useLang';
import styles from './PostListItem.module.css';

interface PostListItemProps {
    post: {
        id: number;
        title: string;
        summary: string;
        slug: string;
        created_at: string;
        type: string;
        views: number;
    };
}

const PostListItem = ({ post }: PostListItemProps) => {
    const lp = useLocalizedPath();
    return (
        <Link to={lp(`/posts/${post.slug}`)} className={styles.link_wrapper}>
            <div className={styles.container}>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.summary}>{post.summary}</p>
                <div className={styles.info}>
                    <p className={styles.date}>{new Date(post.created_at).toLocaleDateString()}</p>
                    <p className={styles.type}>{post.type}</p>
                </div>
            </div>
        </Link>
    );
}

export default PostListItem;