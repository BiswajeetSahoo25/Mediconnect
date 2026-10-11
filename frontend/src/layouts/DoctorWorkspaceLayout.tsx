import { Link, Outlet } from "react-router-dom";
import { mediLogo } from "../assets/icons";
import { useAuth } from "../hooks/useAuth";
import DoctorWorkspaceSidebar from "../components/DoctorWorkspaceSidebar";

function DoctorWorkspaceLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="MediConnect home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
              <img src={mediLogo} alt="" className="h-[18px] w-[18px]" />
            </span>
            <span className="font-['Outfit'] text-xl font-extrabold tracking-tight text-blue-700">
              MediConnect
            </span>
            <Link
              to="/doctor-dashboard"
              className="ml-2 hidden border-l border-slate-200 pl-3 text-sm font-medium text-slate-500 transition hover:text-blue-700 sm:inline"
            >
              Doctor workspace
            </Link>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/doctor-dashboard"
              aria-label="Doctor dashboard overview"
              title="Doctor dashboard overview"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
              </svg>
            </Link>
            <Link
              to="/doctor-dashboard/profile"
              className="hidden text-sm font-medium text-slate-600 hover:text-blue-700 sm:inline"
            >
              Profile settings
            </Link>
            <span
              title={user?.email ?? "Doctor account"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white"
            >
              {user?.email?.charAt(0).toUpperCase() ?? "D"}
            </span>
          </div>
        </div>
      </header>
      <div className="flex">
        <DoctorWorkspaceSidebar />
        <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DoctorWorkspaceLayout;
