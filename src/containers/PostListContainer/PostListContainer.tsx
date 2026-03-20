import { useEffect, useState } from 'react';
import styles from './PostListContainer.module.css';
import { getPosts } from '../../api/getPosts';
import PostListItem from '../../components/PostListItem/PostListItem';

const PostListContainer = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getPosts();
                setPosts(data);
            } catch (error) {
                console.error('포스트 목록 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Study Note</h1>
            <div className={styles.list_section}>
                {posts.map((post) => (
                    <PostListItem key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

export default PostListContainer;