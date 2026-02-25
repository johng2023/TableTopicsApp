import { createBrowserRouter } from "react-router";
import { Home } from "./screens/Home";
import { Recording } from "./screens/Recording";
import { History } from "./screens/History";
import { Dashboard } from "./screens/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/recording",
    Component: Recording,
  },
  {
    path: "/history",
    Component: History,
  },
  {
    path: "/dashboard/:id",
    Component: Dashboard,
  },
]);
