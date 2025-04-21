// AppRouter.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/Hooks";
import localStorageHelper from "../utils/localStorageHelper";
import { getLoggedIn, userLoggedIn } from "../slices/appSlice";
import AuthRouter from "./authRouter";
import HomeRouter from "./homeRouter";
import { setGlobalNavigate, setNavigate } from "../utils/navigationHelper";

const AppRouter: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(getLoggedIn);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set up navigation helper
  useEffect(() => {
    setGlobalNavigate(navigate);
    setNavigate(navigate);
  }, [navigate]);

  const checkUserLoggedIn = () => {
    const userData = localStorageHelper.getItem("@user");
    if (userData) {
      dispatch(userLoggedIn(userData));
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  if (loading) return <div>Loading...</div>;

  return loggedIn ? <HomeRouter /> : <AuthRouter />;
};

export default AppRouter;