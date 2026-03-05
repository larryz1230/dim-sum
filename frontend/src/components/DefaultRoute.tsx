import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import "./DefaultRouter.css"

// public if logged in, protected if not logged in
type RouteMode = "public" | "protected";

interface DefaultRouteProps {
  mode: RouteMode;
  redirectTo?: string;
}

const DefaultRoute: React.FC<DefaultRouteProps> = 
( { mode, redirectTo } ) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner">
        <div className="circle"></div>
      </div>
    );
  }

  if (mode === "protected") {
    return user ? <Outlet /> : <Navigate to={redirectTo || "/login"} replace /> 
  }
  else if (mode == "public") {
    return user ? <Navigate to={redirectTo || "/dashboard"} replace />: <Outlet />;
  }

  return null;
};

export default DefaultRoute;
