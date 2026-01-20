import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import ViewerPage from "../pages/ViewerPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/viewer" replace /> },
      { path: "viewer", element: <ViewerPage /> },
    ],
  },
]);
