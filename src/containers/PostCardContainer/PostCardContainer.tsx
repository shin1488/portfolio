import { useEffect, useState } from 'react';
import PostCardItem from '../../components/PostCardtItem/PostCardItem';
import Loading from '../../components/Loading/Loading';
import styles from './PostCardContainer.module.css';
import { supabase } from '../../api/supabase';

const PostContainer = () => {

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await supabase
                    .from('posts')
                    .select('id, title, summary, slug');
                if (data) setPosts(data);
            } catch (error) {
                console.error('포스트 카드 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <Loading fullScreen={false} />;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Study Note</h1>
            <div className={styles.post_section}>
                {posts.map((post, index) => (
                    <PostCardItem key={post.id} post={post} index={index} />
                ))}
            </div>
        </div>
    );
}

export default PostContainer;