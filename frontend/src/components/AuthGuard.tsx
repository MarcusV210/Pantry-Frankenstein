import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Navbar } from './Navbar';

export const AuthGuard: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="content-rail flex-1 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
};
