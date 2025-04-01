import React, { Suspense, lazy, memo } from "react";
import {
  BrowserRouter as _Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

const Account = lazy(() => import("../screens/account/Account"));
const ExeRole = lazy(() => import("../screens/executiveRole/Role"));
const Landmark = lazy(() => import("../screens/landmark/LandMark"));
const BusStop = lazy(() => import("../screens/busstop/BusStop"));
const Company = lazy(() => import("../screens/company/company"));
const Operator = lazy(() => import("../screens/operator/Operator"));
const CRole = lazy(() => import("../screens/companyRole/Role"));
const BusRoute = lazy(() => import("../screens/busroute/BusRoute"));
const Fare = lazy(() => import("../screens/fare/Fare"));
const Bus = lazy(() => import("../screens/bus/Bus"));

const LoadingIndicator = memo(() => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <div>Loading...</div>
  </div>
));

const HomeRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Routes>
        <Route path="/executive/account" element={<Account />} />
        <Route path="/executive/role" element={<ExeRole />} />
        <Route path="/executive/landmark" element={<Landmark />} />
        <Route path="/executive/busstop" element={<BusStop />} />

        <Route path="/executive/company" element={<Company />} />
        <Route path="/executive/company/:companyId" element={<Company />} />

        <Route path="/executive/company/operator" element={<Operator />} />
        <Route
          path="/executive/company/operator/:companyId"
          element={<Operator />}
        />

        <Route path="/executive/company/role" element={<CRole />} />
        <Route path="/executive/company/role/:companyId" element={<CRole />} />

        <Route path="/executive/company/busroute" element={<BusRoute />} />
        <Route
          path="/executive/company/busroute/:companyId"
          element={<BusRoute />}
        />

        <Route path="/executive/company/fare" element={<Fare />} />
        <Route path="/executive/company/fare/:companyId" element={<Fare />} />

        <Route path="/executive/company/bus" element={<Bus />} />
        <Route path="/executive/company/bus/:companyId" element={<Bus />} />

        <Route
          path="*"
          element={<Navigate to="/executive/account" replace />}
        />
      </Routes>
    </Suspense>
  );
};

export default HomeRouter;
