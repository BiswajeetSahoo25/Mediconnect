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
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Dashboard</p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back 👋
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Manage your healthcare from one place.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Your account</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Email</p>

            <p className="mt-1 font-medium text-slate-900">{user?.email}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Role</p>

            <p className="mt-1 font-medium text-slate-900">{user?.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
