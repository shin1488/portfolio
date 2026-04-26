import styles from "./BottomNavBar.module.css";

const BottomNavBar = () => {
  return (
    <div className={styles.nav_container}>
      <a href="mailto:shin1488dev@gmail.com">Email</a>
      <a href="https://github.com/shin1488" target="_blank">
        Github
      </a>
      <a
        href="https://shin-workspace.notion.site/Shin-s-Workspace-56eb80a72f5641039382f3173ceee1a9"
        target="_blank"
      >
        Notion
      </a>
    </div>
  );
};

export default BottomNavBar;
