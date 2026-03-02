import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './MarkdownContent.module.css';

interface MarkdownProps {
    content: string;
}

const MarkdownContent = ({ content }: MarkdownProps) => {
    return (
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
                {content}
            </ReactMarkdown>
        </main>
    );
};

export default MarkdownContent;