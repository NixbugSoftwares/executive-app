import React from "react";
import AuthRouter from "./authRouter"; 
import HomeRouter from "./homeRouter"; 





const AppRouter: React.FC = () => {
  const isAuthenticated = true; 

  if (isAuthenticated) {
    return (
      <>
        <HomeRouter />
        <AuthRouter />
      </>
    );
  } else {
    return <AuthRouter />;
  }
  
};

export default AppRouter;
