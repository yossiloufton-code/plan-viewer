import PlanViewer from "../viewer/PlanViewer";
import ActionLogTable from "../viewer/ActionLogTable";
import FilesPanel from "../viewer/files/FilesPanel";
import styles from "./ViewerPage.module.css";
import planSrc from "../assets/foundation-plan.png";

export default function ViewerPage() {
  return (
    <div className={styles.layout}>
      <div className={styles.viewerCol}>
        <PlanViewer src={planSrc} />
      </div>
      <div className={styles.sideCol}>
        <FilesPanel />
        <ActionLogTable />
      </div>
    </div>
  );
}
