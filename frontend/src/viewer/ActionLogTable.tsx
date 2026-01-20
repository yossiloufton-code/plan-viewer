import { useMemo } from "react";
import { useViewer } from "./useViewer";

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function ActionLogTable() {
  const { logs, clearLogs } = useViewer();

  const rows = useMemo(() => logs, [logs]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>Action Log</div>
        <button onClick={clearLogs} style={{ padding: "6px 10px" }}>
          Clear
        </button>
      </div>

      <div style={{ overflow: "auto", border: "1px solid #2a2a2a", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#151515" }}>
              <th style={th}>Timestamp</th>
              <th style={th}>Action</th>
              <th style={th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={3}>
                  No actions yet
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{fmtTime(r.timestamp)}</td>
                  <td style={td}>{r.type}</td>
                  <td style={td}>{r.details ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #2a2a2a",
  position: "sticky",
  top: 0,
};

const td: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #222",
  verticalAlign: "top",
};
