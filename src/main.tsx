import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routers/router';
import authRoutes from './routers/authRouter';
import './index.css';

// Merge all routes into a single array
const combinedRoutes = [...routes, ...authRoutes];

// Create a router with the combined routes
const router = createBrowserRouter(combinedRoutes);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
