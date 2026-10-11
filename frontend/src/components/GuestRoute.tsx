import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function GuestRoute() {
  const { isAuthenticated, isLoading, isDoctor, isAdmin } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={isAdmin ? "/admin/doctor-applications" : isDoctor ? "/doctor-dashboard" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default GuestRoute;
