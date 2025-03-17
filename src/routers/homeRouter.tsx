import React, {Suspense, lazy, memo} from "react";
import { BrowserRouter as _Router, Route, Routes, Navigate } from "react-router-dom";

//******************lazy-loaded component for better performance***************************

const Account = lazy(() => import('../screens/account/Account'));
const ExeRole = lazy(() => import('../screens/executiveRole/Role'));
const Landmark = lazy(() => import('../screens/landmark/LandMark'));
const BusStop = lazy(() => import('../screens/busstop/BusStop'));

const Company = lazy(() => import('../screens/company/company'));
const Operator = lazy(() => import('../screens/operator/Operator'));
const CRole = lazy(() => import('../screens/companyRole/Role'));
const BusRoute = lazy(() => import('../screens/busroute/BusRoute'));
const Fare = lazy(() => import('../screens/fare/Fare'));
const Bus = lazy(() => import('../screens/bus/Bus'));


//***************************************define route parameters********************************
export type HomeRouteParams = {
    home: undefined;
    account: undefined;
    busstop: undefined;
    landmark: undefined;
    exerole: undefined;
    operator: undefined;
    companyrole: undefined;
    busroute: undefined;
    fare: undefined;
    bus: undefined;
    AccountCreationForm: undefined;
    exerolecreate: undefined;
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
            <Route path="/account" element={<Account />} />
            <Route path="/exerole" element={<ExeRole />} />
            <Route path="/landmark" element={<Landmark />} />
            <Route path="/busstop" element={<BusStop />} />
            <Route path="/company" element={<Company />} />
            <Route path="/operator" element={<Operator />} />
            <Route path="/companyrole" element={<CRole />} />
            <Route path="/busroute" element={<BusRoute />} />
            <Route path="/fare" element={<Fare />} />
            <Route path="/bus" element={<Bus />} />
            <Route path="*" element={<Navigate to="/account" replace />} />
          </Routes>
        </Suspense>
    );
};


const styles = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.5rem",
  },
};

export default HomeRouter;
