import { useEffect, useState } from 'react';
import { getCardProjects } from '../../api/getProjects';
import ProjectItem from '../../components/ProjectItem/ProjectItem';
import styles from './ProjectContainer.module.css';

interface ProjectContainerProps {
    limit?: number; // 선택적 Prop을 통해 ProjectItme의 개수 제어
}

const ProjectContainer = ({ limit }: ProjectContainerProps) => {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        getCardProjects().then((data) => {
            const displayData = limit ? data.slice(0, limit) : data;
            setProjects(displayData);
        });
    }, [limit]); // limit이 바뀌면 refresh

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Projects</h1>
            <div className={styles.project_section}>
                {projects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}

export default ProjectContainer;