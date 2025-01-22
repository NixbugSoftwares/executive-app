import React from "react";
import AuthRouter from "./authRouter"; 
import HomeRouter from "./homeRouter"; 





const App: React.FC = () => {
  const isAuthenticated = false; 

  return isAuthenticated ? <HomeRouter /> : <AuthRouter />;
};

export default App;
