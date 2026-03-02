import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import CareersContainer from "../../containers/CareersContainer/CareersContainer";
import IntroduceContainer from "../../containers/IntroduceContainer/IntroduceContainer";
import PostContainer from "../../containers/PostCardContainer/PostCardContainer";
import ProjectContainer from "../../containers/ProjectContainer/ProjectContainer";
import SkillsContainer from "../../containers/SkillsContainer/SkillsContainer";
import styles from './Home.module.css';

const Home = () => {
    return (
        <div className={styles.home}>
            <IntroduceContainer />
            <SkillsContainer />
            <CareersContainer />
            <ProjectContainer limit={3} />
            <PostContainer />

            <BottomNavBar />
        </div>
    );
}

export default Home;