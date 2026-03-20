import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PostDetail.module.css';
import { getPost, incrementViews } from '../../api/getPosts';
import DividerSecondary from '../../components/Divider/DividerSecondary';
import MarkdownContent from '../../components/Markdown/MarkdownContent';

const PostDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const data = await getPost(slug);
                setPost(data);

                if (data) {
                    incrementViews(slug, data.views || 0);
                }
            } catch (error) {
                console.error('포스트 가져오기 실패 : ', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (!post) return <div className={styles.error}>포스트를 찾을 수 없습니다.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.title_section}>
                <h1 className={styles.title}>{post.title}</h1>
                <div className={styles.info_section}>
                    <div className={styles.info_section}>
                        <p>{new Date(post.created_at).toLocaleDateString()}</p>
                        <p>{(post.views || 0) + 1} viewed</p>
                    </div>
                </div>
            </header>

            {/* 좀 더 구분감을 주기 위해 2px을 채용함 */}
            <div style={{ '--divider-height': '2px' } as any}>
                <DividerSecondary />
            </div>

            <MarkdownContent content={post.content} />
        </div>
    );
};

export default PostDetail;