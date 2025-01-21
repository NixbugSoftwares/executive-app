import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from '../App';
import { Home } from '../screens/homepage'
import { Account } from '../screens/accountpage';
import { BusStop } from '../screens/busstoppage';
import { ExeRole } from '../screens/executiveRolepage';
import { Operator } from '../screens/operatorpage';
import { CRole } from '../screens/companyRolepage';
import { BusRoute } from '../screens/busroutepage';
import { Fare } from '../screens/farepage';
import { Bus } from '../screens/buspage';


export type AuthRouteProps = {
  
}


const routes: RouteObject[] = [
  { path: '/', element: <App/> },
  { path: '/home', element: <Home /> },
 

  // ***************** executive********************

  { path: '/account', element: <Account /> },
  { path: '/busstop', element: <BusStop /> },
  { path: '/exerole', element: <ExeRole /> },



  // *****************company********************

  { path: '/opertaor', element: <Operator /> },
  { path: '/companyrole', element: <CRole /> },
  { path: '/busroute', element: <BusRoute /> },
  { path: '/fare', element: <Fare /> },
  { path: '/bus', element: <Bus /> },





];

const router = createBrowserRouter(routes);

export default router;
