import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            MediConnect
          </h1>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.email}
              </p>

              <p className="text-xs text-slate-500">
                {user?.role}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
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