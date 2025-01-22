import React from "react";
import AuthRouter from "./routers/authRouter"; 
import HomeRouter from "./routers/homeRouter"; 
const App: React.FC = () => {
  const isAuthenticated = true; 

  return isAuthenticated ? <HomeRouter /> : <AuthRouter />;
};

export default App;
