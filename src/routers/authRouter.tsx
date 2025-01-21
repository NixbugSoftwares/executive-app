import { Login } from "../screens/auth";
import { RouteObject } from "react-router-dom";

const authRoutes: RouteObject[] = [
    { path: "/login", element: <Login /> },
  { path: "/nonetwork", element: <Nonet /> },
  ];

export default authRoutes;
