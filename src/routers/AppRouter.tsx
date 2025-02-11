import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/Hooks";
import localStorageHelper from "../utils/localStorageHelper";
import { getLoggedIn, userLoggedIn } from "../slices/appSlice";
import AuthRouter from "./authRouter";
import HomeRouter from "./homeRouter";


const AppRouter: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(getLoggedIn);
  

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const userData = await localStorageHelper.getItem("@user"); 
      if (userData) {
        dispatch(userLoggedIn(userData));
      }
    };

    checkUserLoggedIn();
  }, [dispatch]);

  return loggedIn ? <HomeRouter /> : <AuthRouter />;
};

export default AppRouter;
