import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoleRoute({
  role,
  requireNoDoctorApplication = false,
}: {
  role: string;
  requireNoDoctorApplication?: boolean;
}) {
  const { user, isLoading, isDoctor, doctorApplicationStatus } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  const isAllowed = role === "DOCTOR" ? isDoctor : user?.role === role;
  if (!isAllowed) return <Navigate to="/dashboard" replace />;
  if (requireNoDoctorApplication && doctorApplicationStatus !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoleRoute;
