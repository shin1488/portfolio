import SkillItem from "../../components/SkillItem/SkillItem";
import styles from './SkillContainer.module.css';

const SkillContainer = ({ items }: any) => (
    <div className={styles.container}>
        {items.map((item: any) => (
            <SkillItem key={item.name} name={item.name} />
        ))}
    </div>
);

export default SkillContainer;