import { techStack } from '../../data/techStack';
import DividerSecondary from '../../components/Divider/DividerSecondary';
import SkillContainer from '../SkillContainer/SkillContainer';
import styles from './SkillsContainer.module.css';

const SkillsContainer = () => {
    const mySkills = [
        { category: "Language", names: ["Kotlin", "Java", "TypeScript", "JavaScript", "Python", "Dart", "C"] },
        { category: "Platform & Frameworks", names: ["Android", "React", "Spring", "Flutter"] },
        { category: "Others", names: ["Git", "Github", "MySQL", "Firebase", "Supabase", "Figma", "Docker"] }
    ];

    const filteredStack = mySkills.map(({ category, names }) => {
        const categoryData = techStack.find(c => c.category === category);

        const orderedItems = names.map(name =>
            categoryData?.items.find(item => item.name === name)
        ).filter(Boolean);

        return {
            category,
            items: orderedItems
        };
    }).filter(c => c.items.length > 0);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Skills</h1>
            <div className={styles.skill_section}>
                {filteredStack.map(({ category, items }) => (
                    <div className={styles.child_container} key={category}>
                        <p className={styles.category}>{category}</p>
                        <DividerSecondary />
                        <SkillContainer items={items} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkillsContainer;