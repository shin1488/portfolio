import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './ProjectItem.module.css';
import { getIconUrl } from '../../api/getIconUrl';
import { useLocalizedField, useLocalizedPath } from '../../i18n/useLang';

// stack_logo / stack_section gap과 동기화 (CSS와 함께 변경 시 같이 수정)
const STACK_LOGO_WIDTH = 22;
const STACK_GAP = 8;

const ProjectItem = ({ project }: any) => {
    const { t } = useTranslation();
    const lp = useLocalizedPath();
    const lf = useLocalizedField();

    const stacks = project?.stacks ?? [];
    const stackContainerRef = useRef<HTMLDivElement | null>(null);
    // 초기엔 모두 표시 → useLayoutEffect에서 측정 후 들어갈 수 있는 만큼만 노출
    const [visibleStackCount, setVisibleStackCount] = useState(stacks.length);

    useLayoutEffect(() => {
        const node = stackContainerRef.current;
        if (!node || stacks.length === 0) return;

        const update = () => {
            const width = node.clientWidth;
            // N개 아이콘이 들어가려면 N * ICON + (N-1) * GAP <= width
            // → N <= (width + GAP) / (ICON + GAP)
            const fit = Math.floor((width + STACK_GAP) / (STACK_LOGO_WIDTH + STACK_GAP));
            setVisibleStackCount(Math.max(0, Math.min(stacks.length, fit)));
        };

        update();

        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => observer.disconnect();
    }, [stacks.length]);

    if (!project) return null;

    const title = lf<string>(project, 'title');
    const summary = lf<string>(project, 'summary');
    const visibleStacks = stacks.slice(0, visibleStackCount);

    return (
        <Link to={lp(`/projects/${project.slug}`)} className={styles.link_wrapper}>
            <div className={styles.container}>
                <div className={styles.img_section}>
                    <img className={styles.img} src={project.thumbnail_url} alt={title} />
                </div>
                <div className={styles.info_section}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.date}>
                        {/* 날짜 파싱 */}
                        {project.start_date?.replace(/-/g, '.').slice(0, 7)} ~
                        {project.end_date ? project.end_date.replace(/-/g, '.').slice(0, 7) : t('projectDetail.inProgress')}
                    </p>
                    <p className={styles.summary}>{summary}</p>
                    <div className={styles.tag_section}>
                        <div ref={stackContainerRef} className={styles.stack_section}>
                            {visibleStacks.map((stack: any) => (
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
                            {project.is_team ? t('projectDetail.teamProject') : t('projectDetail.soloProject')}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ProjectItem;
