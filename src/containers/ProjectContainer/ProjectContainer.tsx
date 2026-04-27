import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getCardProjects } from '../../api/getProjects';
import ProjectItem from '../../components/ProjectItem/ProjectItem';
import Loading from '../../components/Loading/Loading';
import { useLocalizedPath } from '../../i18n/useLang';
import styles from './ProjectContainer.module.css';

interface ProjectContainerProps {
    limit?: number; // 선택적 Prop을 통해 ProjectItem의 개수 제어
}

const ProjectContainer = ({ limit }: ProjectContainerProps) => {
    const { t } = useTranslation();
    const lp = useLocalizedPath();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true); // 데이터 fetch 시작 시 로딩 활성화
                const data = await getCardProjects();
                const displayData = limit ? data.slice(0, limit) : data;
                setProjects(displayData);
            } catch (error) {
                console.error('프로젝트 목록 로드 실패:', error);
            } finally {
                setLoading(false); // 성공/실패 여부와 상관없이 로딩 종료
            }
        };

        fetchProjects();
    }, [limit]); // limit이 변경될 때마다 다시 실행

    if (loading) return <Loading fullScreen={false} />;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Projects</h1>
            <div className={styles.project_section}>
                {projects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                ))}
            </div>
            {/* limit이 지정된 경우(=홈에서 일부만 보여주는 모드)에만 더보기 버튼 노출 */}
            {limit !== undefined && (
                <Link to={lp('/projects')} className={styles.more_btn_link}>
                    <button className={styles.more_btn}>→ {t('common.viewMore')}</button>
                </Link>
            )}
        </div>
    );
}

export default ProjectContainer;
