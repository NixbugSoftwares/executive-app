import React, { Suspense, lazy, memo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../store/Hooks";
import { getLoggedIn } from "../slices/appSlice";

// **************************************** Lazy-loaded components for better performance *********************************

const Login = lazy(() => import("../screens/auth/Login"));

// *****************************************Define route parameters *******************************************************
export type AuthRouteParams = {
  login: undefined;
};

// **************************************** Loading indicator component ***************************************************
const LoadingIndicator = memo(() => (
  <div style={styles.loadingContainer}>
    <div>Loading...</div>
  </div>
));

const AuthRouter: React.FC = () => {
  const loggedIn = useAppSelector(getLoggedIn);

  // If user is already logged in, redirect to home
  if (loggedIn) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

// **************************************************Styles for the loading indicator ************************************
const styles = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.5rem",
  },
};

export default AuthRouter;
