import { createBrowserRouter } from "react-router";
import AppMain from "./AppMain";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppMain />,
  },
  {
    path: "*",
    element: <AppMain />,
  },
]);