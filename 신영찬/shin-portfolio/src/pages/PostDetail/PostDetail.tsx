import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './PostDetail.module.css';
import { getPosts, incrementViews } from '../../api/getPosts';
import DividerSecondary from '../../components/Divider/DividerSecondary';

const PostDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const data = await getPosts(slug);
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
            <Link to="/" className={styles.back_btn}>← Back to Home</Link>

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

            <main className={styles.content}>
                <ReactMarkdown
                    components={{
                        code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <div className={styles.code_block_wrapper}>
                                    <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        className={styles.syntax_custom}
                                        useInlineStyles={true}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                </div>
                            ) : (
                                <code className={styles.inline_code} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {post.content}
                </ReactMarkdown>
            </main>
        </div>
    );
};

export default PostDetail;