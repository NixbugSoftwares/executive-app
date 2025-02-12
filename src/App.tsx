import React, { useState, useEffect } from "react";
import { BrowserRouter as _Router, Route, Routes } from "react-router-dom";
import AppRouter from "./routers/AppRouter";
import { Nonet } from "./common";
import { toast } from "react-toastify";
import store from "./store/Store";
import { Provider as ReduxProvider } from "react-redux";


const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're online now");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You're offline now");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
 
  return (
    <ReduxProvider store={store}>
      
    <Routes>
    {isOnline ? (
      <Route path="*" element={<AppRouter />} />
    ) : (
      <Route path="*" element={<Nonet />} />
    )}
    
    <Route path="*" element={<AppRouter />} />

  </Routes>
  </ReduxProvider>  
  );
};

export default App;
