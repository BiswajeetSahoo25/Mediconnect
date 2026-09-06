import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { mapPinIcon } from "../assets/icons";
const plusIcon =
  "https://www.figma.com/api/mcp/asset/8c977e73-c7a2-4348-8ad7-9bceb027f1a7.svg";

const chevronDownIcon =
  "https://www.figma.com/api/mcp/asset/002d0b1d-9d6d-48b9-8e76-9d88d2e8629f.svg";

function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="border-b border-[#e2e8f0] bg-white">
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-20">
        {/* Left: Logo + Location */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Medico home"
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a73e8]">
              <img src={plusIcon} alt="" className="h-[18px] w-[18px]" />
            </span>

            <span className="font-['Outfit'] text-[24px] font-extrabold leading-none tracking-tight text-[#1a73e8]">
              Medico
            </span>
          </Link>

          {/* Location */}
          <button
            type="button"
            className="hidden h-8 items-center gap-2 rounded-lg bg-[#f0f5fd] px-3 md:flex"
          >
            <img src={mapPinIcon} alt="" className="h-6 w-6  shrink-0" />

            <span className="whitespace-nowrap font-['DM_Sans'] text-[13px] font-semibold leading-none text-[#1a73e8]">
              Bangalore, KA
            </span>

            <img
              src={chevronDownIcon}
              alt=""
              className="ml-0.5 h-3.5 w-3.5 shrink-0"
            />
          </button>
        </div>

        {/* Center navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          <Link
            to="/"
            className="font-['DM_Sans'] text-[14px] font-bold leading-none text-[#1a73e8]"
          >
            Home
          </Link>

          <Link
            to={isAuthenticated ? "/doctors" : "/signup"}
            className="font-['DM_Sans'] text-[14px] font-medium leading-none text-[#334155] transition-colors hover:text-[#1a73e8]"
          >
            Find Doctors
          </Link>

          <Link
            to={isAuthenticated ? "/appointments" : "/signup"}
            className="font-['DM_Sans'] text-[14px] font-medium leading-none text-[#334155] transition-colors hover:text-[#1a73e8]"
          >
            Appointments
          </Link>

          <Link
            to={isAuthenticated ? "/records" : "/signup"}
            className="font-['DM_Sans'] text-[14px] font-medium leading-none text-[#334155] transition-colors hover:text-[#1a73e8]"
          >
            Health Records
          </Link>

          <Link
            to="/help"
            className="font-['DM_Sans'] text-[14px] font-medium leading-none text-[#334155] transition-colors hover:text-[#1a73e8]"
          >
            Help
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Join as Provider - LEFT of account */}
              <Link
                to="/apply-as-doctor"
                className="hidden rounded-lg border border-[#e2e8f0] bg-white px-6 py-3 font-['DM_Sans'] text-[14px] font-semibold leading-none text-[#0f172a] transition-all hover:border-[#1a73e8] hover:bg-[#f8fbff] sm:flex"
              >
                Join as Provider
              </Link>

              {/* Account */}
              <Link
                to="/account"
                aria-label="Open account"
                className="flex items-center"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a73e8] font-['DM_Sans'] text-sm font-semibold text-white">
                  {user?.email?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </Link>
            </>
          ) : (
            <>
              {/* Join as Provider - LEFT */}
              <Link
                to="/signup"
                className="whitespace-nowrap rounded-lg border border-[#e2e8f0] bg-white px-6 py-3 font-['DM_Sans'] text-[14px] font-semibold leading-none text-[#0f172a] transition-all hover:border-[#1a73e8] hover:bg-[#f8fbff]"
              >
                Join as Provider
              </Link>

              {/* Login / Sign Up - RIGHT */}
              <Link
                to="/login"
                className="whitespace-nowrap font-['DM_Sans'] text-[14px] font-semibold leading-none text-[#0f172a] transition-colors hover:text-[#1a73e8]"
              >
                Login / Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="border-t border-[#e2e8f0] lg:hidden">
        <div className="flex items-center gap-6 overflow-x-auto px-5 py-3">
          <Link
            to="/"
            className="whitespace-nowrap font-['DM_Sans'] text-sm font-bold text-[#1a73e8]"
          >
            Home
          </Link>

          <Link
            to={isAuthenticated ? "/doctors" : "/signup"}
            className="whitespace-nowrap font-['DM_Sans'] text-sm font-medium text-[#334155]"
          >
            Find Doctors
          </Link>

          <Link
            to={isAuthenticated ? "/appointments" : "/signup"}
            className="whitespace-nowrap font-['DM_Sans'] text-sm font-medium text-[#334155]"
          >
            Appointments
          </Link>

          <Link
            to={isAuthenticated ? "/records" : "/signup"}
            className="whitespace-nowrap font-['DM_Sans'] text-sm font-medium text-[#334155]"
          >
            Health Records
          </Link>

          <Link
            to="/help"
            className="whitespace-nowrap font-['DM_Sans'] text-sm font-medium text-[#334155]"
          >
            Help
          </Link>

          {!isAuthenticated && (
            <>
              <Link
                to="/signup"
                className="whitespace-nowrap font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]"
              >
                Join as Provider
              </Link>

              <Link
                to="/login"
                className="whitespace-nowrap font-['DM_Sans'] text-sm font-semibold text-[#0f172a]"
              >
                Login / Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
