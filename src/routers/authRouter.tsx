import { Login } from "../screens/auth";
import { Nonet } from "../common";
import { RouteObject } from "react-router-dom";

const authRoutes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/nonetwork", element: <Nonet /> },
];

export default authRoutes;
