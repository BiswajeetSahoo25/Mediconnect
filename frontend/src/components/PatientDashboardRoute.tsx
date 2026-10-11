import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function PatientDashboardRoute() {
  const { isDoctor } = useAuth();

  if (isDoctor) return <Navigate to="/doctor-dashboard" replace />;
  return <Outlet />;
}

export default PatientDashboardRoute;
