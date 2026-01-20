import { useFiles } from "./useFiles";
import styles from "./FilesPanel.module.css";

export default function FilesPanel() {
  const {
    projectName,
    projectId,
    filterType,
    files,
    busy,
    error,
    setProjectName,
    setProjectId,
    setFilterType,
    createProject,
    refreshFiles,
    uploadFiles,
    downloadByType,
    clearError,
  } = useFiles();

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h3>Backend Files</h3>
        {error && (
          <div className={styles.error}>
            <span>{error}</span>
            <button onClick={clearError} className={styles.smallBtn}>x</button>
          </div>
        )}
      </header>

      <div className={styles.row}>
        <input
          className={styles.input}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
        <button className={styles.btn} onClick={createProject} disabled={busy}>
          Create
        </button>
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="Project ID (uuid)"
        />
        <button className={styles.btn} onClick={refreshFiles} disabled={busy || !projectId}>
          Refresh
        </button>
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          placeholder="Filter type (e.g. pdf)"
        />
        <button className={styles.btn} onClick={downloadByType} disabled={busy || !projectId || !filterType}>
          Download by type
        </button>
      </div>

      <div className={styles.row}>
        <input type="file" multiple disabled={busy || !projectId} onChange={(e) => uploadFiles(e.target.files)} />
      </div>

      <div className={styles.meta}>
        Files: <b>{files.length}</b>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id}>
                <td title={f.original_name}>{f.original_name}</td>
                <td>{f.file_type}</td>
                <td>{f.size_bytes}</td>
                <td>{f.status}</td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>No files</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
