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
// const BusStop = lazy(() => import("../screens/busStop/BusStop"));
const Company = lazy(() => import("../screens/company/company"));
const Operator = lazy(() => import("../screens/operator/Operator"));
const CRole = lazy(() => import("../screens/operatorRole/Role"));
const BusRoute = lazy(() => import("../screens/busroute/BusRoute"));
const GlobalFare = lazy(() => import("../screens/globalfare/Fare"));
const Bus = lazy(() => import("../screens/bus/Bus"));
const CompanyFare = lazy(() => import("../screens/companyFare/CompanyFare"));
const Service = lazy(() => import("../screens/service/service"));
const Schedule = lazy(() => import("../screens/schedule/schedule"));
const Duty = lazy(() => import("../screens/duty/duty"));
const Statement = lazy(() => import("../screens/statement/statement"));
const PapperTicket = lazy(() => import("../screens/ticket/ticket"));
const Profile=lazy(() => import("../common/profile/profile"));

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
        {/* <Route path="/executive/busstop" element={<BusStop />} /> */}
        <Route path="/executive/global-fare" element={<GlobalFare />} />

        <Route path="/executive/company" element={<Company />} />
        <Route path="/executive/company/:companyId" element={<Company />} />

        <Route path="/executive/company/operator" element={<Operator />} />
        <Route
          path="/executive/company/operator/:companyId"
          element={<Operator />}
        />

        <Route path="/executive/company/role" element={<CRole />} />
        <Route path="/executive/company/role/:companyId" element={<CRole />} />

        <Route path="/executive/company/bus" element={<Bus />} />
        <Route path="/executive/company/bus/:companyId" element={<Bus />} />

        <Route path="/executive/company/busroute" element={<BusRoute />} />
        <Route
          path="/executive/company/busroute/:companyId"
          element={<BusRoute />}
        />

        <Route path="/executive/company/fare" element={<CompanyFare />} />
        <Route
          path="/executive/company/fare/:companyId"
          element={<CompanyFare />}
        />

        <Route path="/executive/service" element={<Service />} />
        <Route
          path="/executive/company/service/:companyId"
          element={<Service />}
        />

        <Route path="/executive/schedule" element={<Schedule />} />
        <Route
          path="/executive/company/schedule/:companyId"
          element={<Schedule />}
        />

        <Route path="/executive/duty" element={<Duty />} />
        <Route path="/executive/company/duty/:companyId" element={<Duty />} />

        <Route path="/executive/papper-ticket" element={<PapperTicket />} />
        <Route
          path="/executive/company/papper-ticket/:companyId"
          element={<PapperTicket />}
        />

        <Route path="/executive/statment" element={<Statement/>} />
        <Route path="/executive/company/statment/:companyId" element={<Statement/>} />

        <Route path="/profile" element={<Profile />} />
        <Route
          path="*"
          element={<Navigate to="/executive/account" replace />}
        />
      </Routes>
    </Suspense>
  );
};

export default HomeRouter;
