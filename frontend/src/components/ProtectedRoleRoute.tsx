import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoleRoute({ role }: { role: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (user?.role !== role) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export default ProtectedRoleRoute;
