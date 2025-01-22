import React, {Suspense, lazy, memo} from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

//******************lazy-loaded component for better performance***************************
const Home = lazy(() => import('../screens/homepage/home'));
const Account = lazy(() => import('../screens/accountpage/Account'));
const BusStop = lazy(() => import('../screens/busstoppage/BusStop'));
const ExeRole = lazy(() => import('../screens/executiveRolepage/RolePage'));
const Operator = lazy(() => import('../screens/operatorpage/Operatorpage'));
const CRole = lazy(() => import('../screens/companyRolepage/CRolePage'));
const BusRoute = lazy(() => import('../screens/busroutepage/RoutePage'));
const Fare = lazy(() => import('../screens/farepage/FarePage'));
const Bus = lazy(() => import('../screens/buspage/BusPage'));

//***************************************define route parameters******************************** 
export type HomeRouteParams = {
    home: undefined;
    account: undefined;
    busstop: undefined;
    exerole: undefined;
    operator: undefined;
    companyrole: undefined;
    busroute: undefined;
    fare: undefined;
    bus: undefined;
  };


  // ***************************************Loading indicator component*************************
  const LoadingIndicator = memo(() => (
    <div style={styles.loadingContainer}>
      <div>Loading...</div>
    </div>
  ));

  const HomeRouter: React.FC = () => {
    return (
      
        <Suspense fallback={<LoadingIndicator />}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/busstop" element={<BusStop />} />
            <Route path="/exerole" element={<ExeRole />} />
            <Route path="/operator" element={<Operator />} />
            <Route path="/companyrole" element={<CRole />} />
            <Route path="/busroute" element={<BusRoute />} />
            <Route path="/fare" element={<Fare />} />
            <Route path="/bus" element={<Bus />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
    );
};


    const styles = {
        loadingContainer: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5rem',
        },
      }
  
  export default HomeRouter;