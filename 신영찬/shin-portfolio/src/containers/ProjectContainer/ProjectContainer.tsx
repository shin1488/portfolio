import { useEffect, useState } from 'react';
import { getProjects } from '../../api/getProjects';
import ProjectItem from '../../components/ProjectItem/ProjectItem';
import styles from './ProjectContainer.module.css';

const ProjectContainer = () => {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        getProjects().then((data) => {
            setProjects(data.slice(0, 3));
        });
    }, []);

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