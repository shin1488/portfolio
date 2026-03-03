import { getIconUrl } from '../../api/getIconUrl';
import styles from './SkillItem.module.css';

const SkillIcon = ({ name }: any) => {
    return (
        <div className={styles.icon_container}>
            <img className={styles.img} src={getIconUrl(name)}/>
            <p className={styles.name} >{name}</p>
        </div>
    );
}

export default SkillIcon;