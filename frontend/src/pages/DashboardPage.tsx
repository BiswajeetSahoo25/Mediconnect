import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Welcome to MediConnect
        </h1>

        <p className="mt-2">
          Logged in as {user?.email}
        </p>

        <p className="mt-1">
          Role: {user?.role}
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;