import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";

function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
            MediConnect
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.email}
              </p>

              <p className="text-xs text-slate-500">
                {user?.role}
              </p>
            </div>

            <Link
              to="/account"
              className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm font-semibold text-slate-700 transition hover:border-[#14bef0] hover:bg-sky-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087ca3] text-sm text-white">{user?.email?.charAt(0).toUpperCase()}</span>
              <span className="hidden sm:inline">Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Application */}
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
