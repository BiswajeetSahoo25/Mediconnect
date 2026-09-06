import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="border-b border-slate-100 bg-white shadow-sm">
      <nav className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14bef0] text-sm text-white">+</span>
          MediConnect
        </Link>

        <div className="order-3 flex w-full items-center gap-4 overflow-x-auto text-sm sm:order-2 sm:w-auto sm:gap-6">
          <Link
            to={isAuthenticated ? "/doctors" : "/signup"}
            className="whitespace-nowrap font-medium text-slate-600 transition hover:text-[#087ca3]"
          >
            Find doctors
          </Link>
          <Link to={isAuthenticated ? "/appointments" : "/signup"} className="whitespace-nowrap font-medium text-slate-600 transition hover:text-[#087ca3]">Appointments</Link>
          <Link to={isAuthenticated ? "/apply-as-doctor" : "/signup"} className="whitespace-nowrap font-medium text-slate-600 transition hover:text-[#087ca3]">For doctors</Link>
        </div>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden text-sm font-semibold text-slate-700 transition hover:text-[#087ca3] md:inline"
              >
                Dashboard
              </Link>

              <Link
                to="/account"
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm font-semibold text-slate-700 transition hover:border-[#14bef0] hover:bg-sky-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087ca3] text-sm text-white">{user?.email.charAt(0).toUpperCase()}</span>
                <span className="hidden sm:inline">Account</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#087ca3]"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-[#14bef0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0daedc] focus:outline-none focus:ring-2 focus:ring-[#14bef0] focus:ring-offset-2"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
