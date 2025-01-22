import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// **************************************** Lazy-loaded components for better performance *********************************

const Login = lazy(() => import('../screens/auth/Login'));



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
  return (
    
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    
  );
};

// **************************************** Styles for the loading indicator ***********************************************
const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem',
  },
};

export default AuthRouter;