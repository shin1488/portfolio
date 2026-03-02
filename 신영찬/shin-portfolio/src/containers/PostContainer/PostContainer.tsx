import { useEffect, useState } from 'react';
import PostItem from '../../components/PostItem/PostItem';
import styles from './PostContainer.module.css';
import { supabase } from '../../api/supabase';

const PostContainer = () => {

    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data } = await supabase
                .from('posts')
                .select('id, title, summary, slug');
            if (data) setPosts(data);
        };
        fetchPosts();
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Study Note</h1>
            <div className={styles.post_section}>
                {posts.map((post, index) => (
                    <PostItem key={post.id} post={post} index={index} />
                ))}
            </div>
        </div>
    );
}

export default PostContainer;