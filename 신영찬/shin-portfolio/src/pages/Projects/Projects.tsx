import ProjectContainer from '../../containers/ProjectContainer/ProjectContainer';
import styles from './Projects.module.css'

const Projects = () => {
    return (
        <div className={styles.projects}>
            <ProjectContainer />
        </div>
    );
}

export default Projects;