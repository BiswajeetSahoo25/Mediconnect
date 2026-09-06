import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function OnboardingRequiredRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.onboardingCompletedAt) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default OnboardingRequiredRoute;
