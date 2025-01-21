import { Login } from "../screens/auth";
import { RouteObject } from "react-router-dom";


export type AuthRoute = {
    path: string;
}

export const authRoutes: RouteObject[] = [
    { path: "/login", element: <Login /> },
  ];