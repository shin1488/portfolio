import { useLayoutEffect } from "react";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import CareersContainer from "../../containers/CareersContainer/CareersContainer";
import IntroduceContainer from "../../containers/IntroduceContainer/IntroduceContainer";
import PostContainer from "../../containers/PostCardContainer/PostCardContainer";
import ProjectContainer from "../../containers/ProjectContainer/ProjectContainer";
import SkillsContainer from "../../containers/SkillsContainer/SkillsContainer";
import { getScrollMemory, saveScrollMemory } from "../../utils/scrollMemory";
import styles from './Home.module.css';

export const HOME_SCROLL_KEY = "home";

const Home = () => {
    useLayoutEffect(() => {
        const saved = getScrollMemory(HOME_SCROLL_KEY);
        let retry: ReturnType<typeof setTimeout> | null = null;

        if (saved === null) {
            window.scrollTo(0, 0);
        } else {
            window.scrollTo(0, saved);
            // 컨테이너들이 비동기 fetch로 늦게 길어지는 경우, 한 번 더 보정
            retry = setTimeout(() => {
                if (Math.abs(window.scrollY - saved) > 50) {
                    window.scrollTo(0, saved);
                }
            }, 300);
        }

        return () => {
            if (retry !== null) clearTimeout(retry);
            // 다른 페이지로 떠날 때 현재 스크롤 위치 저장 → 다음 진입 시 복원
            saveScrollMemory(HOME_SCROLL_KEY, window.scrollY);
        };
    }, []);

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
