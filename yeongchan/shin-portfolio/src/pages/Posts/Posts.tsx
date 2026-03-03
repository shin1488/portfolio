import PostListContainer from '../../containers/PostListContainer/PostListContainer';
import styles from './Posts.module.css'

const Posts = () => {
    return (
        <div className={styles.posts}>
            <PostListContainer />
        </div>
    );
}

export default Posts;