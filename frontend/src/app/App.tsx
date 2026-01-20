import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Outlet />
    </div>
  );
}
