import { Link } from 'react-router-dom';
import styles from './PostItem.module.css';

interface PostItemProps {
    post: any;
    index: number;
}

const PostItem = ({ post, index }: PostItemProps) => {
    return (
        <div 
            className={styles.container}
            style={{ '--index': index } as React.CSSProperties}
        >
            <h2 className={styles.title}>{post.title}</h2>
            <p className={styles.summary}>{post.summary}</p>
            <Link to={`/post/${post.slug}`} className={styles.link_nodeco}>
                <button className={styles.details_btn}>→ details</button>
            </Link>
        </div>
    );
};

export default PostItem;