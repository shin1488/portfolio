import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ProjectDetail.module.css';
import { getProject } from '../../api/getProjects';
import { getIconUrl } from '../../api/getIconUrl';
import DividerSecondary from '../../components/Divider/DividerSecondary';
import MarkdownContent from '../../components/Markdown/MarkdownContent';

const ProjectDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await getProject(slug);
                setProject(data);
            } catch (error) {
                console.error('프로젝트 가져오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [slug]);

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (!project) return <div className={styles.error}>프로젝트를 찾을 수 없습니다.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{project.title}</h1>
                <div className={styles.info_section}>
                    <div className={styles.description_section}>
                        <p className={styles.info_category}>프로젝트 설명</p>
                        <p>{project.summary}</p>
                    </div>
                    <div className={styles.date_section}>
                        <p className={styles.info_category}>기간</p>
                        <div className={styles.date}>
                            {project.start_date?.slice(0, 7).replace(/-/g, '.')} ~ {project.end_date?.slice(0, 7).replace(/-/g, '.') || '진행 중'}
                        </div>
                    </div>
                    <div className={styles.stack_section}>
                        <p className={styles.info_category}>기술 스택</p>
                        <div className={styles.stack_list}>
                            {project.stacks?.map((stack: any) => (
                                <img
                                    key={stack.name}
                                    src={getIconUrl(stack.name)}
                                    alt={stack.name}
                                    className={styles.stack_logo}
                                    title={stack.name}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={styles.type_section}>
                        <p className={styles.info_category}>프로젝트 형태</p>
                        <p className={styles.project_type}>{project.is_team ? "팀 프로젝트" : "개인 프로젝트"}</p>
                    </div>
                </div>
            </header>

            <div style={{ '--divider-height': '2px' } as any}>
                <DividerSecondary />
            </div>

            <MarkdownContent content={project.content} />
        </div >
    );
};

export default ProjectDetail;