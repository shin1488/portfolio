import styles from './ProjectItem.module.css';
import { getIconUrl } from '../../api/getIconUrl';
import { Link } from 'react-router-dom';

const ProjectItem = ({ project }: any) => {
    if (!project) return null;

    return (
        <Link to={`/projects/${project.slug}`} className={styles.link_wrapper}>
            <div className={styles.container}>
                <div className={styles.img_section}>
                    <img className={styles.img} src={project.thumbnail_url} alt={project.title} />
                </div>
                <div className={styles.info_section}>
                    <h2 className={styles.title}>{project.title}</h2>
                    <p className={styles.date}>
                        {/* 날짜 파싱 */}
                        {project.start_date?.replace(/-/g, '.').slice(0, 7)} ~
                        {project.end_date ? project.end_date.replace(/-/g, '.').slice(0, 7) : '진행 중'}
                    </p>
                    <p className={styles.summary}>{project.summary}</p>
                    <div className={styles.tag_section}>
                        <div className={styles.stack_section}>
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
                        <p className={`${styles.project_type} ${project.is_team ? styles.team : styles.personal}`}>
                            {project.is_team ? "팀 프로젝트" : "개인 프로젝트"}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ProjectItem;