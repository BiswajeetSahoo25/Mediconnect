import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserLocation } from "../hooks/useUserLocation";
import { mapPinIcon } from "../assets/icons";
import { mediLogo } from "../assets/icons";

const plusIcon = mediLogo;

function Navbar() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const {
    isAuthenticated,
    user,
    doctorApplicationStatus,
    isDoctor,
    isPatient,
  } = useAuth();
  const { location, loading } = useUserLocation();

  const locationText = loading
    ? "Detecting location..."
    : location?.city
      ? `${location.city}${location.state ? `, ${location.state}` : ""}`
      : "Location unavailable";
  const isCurrent = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
  const desktopNavClass = (to: string) =>
    `font-['DM_Sans'] text-[14px] leading-none transition-colors ${isCurrent(to) ? "font-bold text-[#1a73e8]" : "font-medium text-[#334155] hover:text-[#1a73e8]"}`;
  const mobileNavClass = (to: string) =>
    `block rounded-xl px-3 py-2.5 font-['DM_Sans'] text-sm transition-colors ${isCurrent(to) ? "bg-blue-50 font-semibold text-[#1a73e8]" : "font-medium text-[#334155] hover:bg-slate-50 hover:text-[#1a73e8]"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-5 lg:px-10 xl:px-16">
        {/* Left: Logo + Location */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-10">
          <Link
            to="/"
            aria-label="Medico home"
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a73e8]">
              <img src={plusIcon} alt="" className="h-[18px] w-[18px]" />
            </span>

            <span className="font-['Outfit'] text-[21px] font-extrabold leading-none tracking-tight text-[#1a73e8] sm:text-[24px]">
              MediCo
            </span>
          </Link>

          <div className="hidden h-8 items-center gap-2 rounded-lg bg-[#f0f5fd] px-3 md:flex">
            <img src={mapPinIcon} alt="" className="h-6 w-6 shrink-0" />

            <span className="whitespace-nowrap font-['DM_Sans'] text-[13px] font-semibold leading-none text-[#1a73e8]">
              {locationText}
            </span>
          </div>
        </div>

        {/* Center navigation */}
        <div className="hidden items-center gap-5 xl:flex xl:gap-7">
          <Link
            to="/"
            aria-current={isCurrent("/") ? "page" : undefined}
            className={desktopNavClass("/")}
          >
            Home
          </Link>

          <Link
            to={isAuthenticated ? "/doctors" : "/signup"}
            aria-current={isCurrent("/doctors") ? "page" : undefined}
            className={desktopNavClass("/doctors")}
          >
            Find Doctors
          </Link>

          <Link
            to="/healthcare"
            aria-current={isCurrent("/healthcare") ? "page" : undefined}
            className={desktopNavClass("/healthcare")}
          >
            Find Healthcare
          </Link>

          <Link
            to={isAuthenticated ? "/appointments" : "/signup"}
            aria-current={isCurrent("/appointments") ? "page" : undefined}
            className={desktopNavClass("/appointments")}
          >
            Appointments
          </Link>

          <Link
            to="/medicines"
            aria-current={isCurrent("/medicines") ? "page" : undefined}
            className={desktopNavClass("/medicines")}
          >
            Medicines
          </Link>

          <Link
            to="/help"
            aria-current={isCurrent("/help") ? "page" : undefined}
            className={desktopNavClass("/help")}
          >
            Help
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              {isPatient && doctorApplicationStatus === null && !isDoctor && (
                <Link
                  to="/apply-as-doctor"
                  className="hidden rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 font-['DM_Sans'] text-[14px] font-semibold leading-none text-[#0f172a] transition-all hover:border-[#1a73e8] hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:inline-flex"
                >
                  Apply as doctor
                </Link>
              )}

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
              <Link
                to="/signup"
                className="hidden whitespace-nowrap rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 font-['DM_Sans'] text-[14px] font-semibold leading-none text-[#0f172a] transition-all hover:border-[#1a73e8] hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:inline-flex"
              >
                Join as Provider
              </Link>

              <Link
                to="/login"
                className="hidden whitespace-nowrap font-['DM_Sans'] text-[14px] font-semibold leading-none text-[#0f172a] transition-colors hover:text-[#1a73e8] sm:inline-flex"
              >
                Login / Sign Up
              </Link>
            </>
          )}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 xl:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {mobileMenuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Compact navigation for tablet and mobile */}
      {mobileMenuOpen && <div id="mobile-navigation" className="border-t border-[#e2e8f0] bg-white px-4 py-3 shadow-lg sm:px-5 xl:hidden">
          <div
            className="mx-auto grid max-w-[1440px] gap-1 sm:grid-cols-2"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setMobileMenuOpen(false);
                mobileMenuButtonRef.current?.focus();
              }
            }}
          >
          <Link
            to="/"
            aria-current={isCurrent("/") ? "page" : undefined}
            className={mobileNavClass("/")}
          >
            Home
          </Link>

          <Link
            to={isAuthenticated ? "/doctors" : "/signup"}
            aria-current={isCurrent("/doctors") ? "page" : undefined}
            className={mobileNavClass("/doctors")}
          >
            Find Doctors
          </Link>

          <Link
            to="/healthcare"
            aria-current={isCurrent("/healthcare") ? "page" : undefined}
            className={mobileNavClass("/healthcare")}
          >
            Find Healthcare
          </Link>

          <Link
            to={isAuthenticated ? "/appointments" : "/signup"}
            aria-current={isCurrent("/appointments") ? "page" : undefined}
            className={mobileNavClass("/appointments")}
          >
            Appointments
          </Link>

          <Link
            to="/medicines"
            aria-current={isCurrent("/medicines") ? "page" : undefined}
            className={mobileNavClass("/medicines")}
          >
            Get Medicines
          </Link>

          <Link
            to="/help"
            aria-current={isCurrent("/help") ? "page" : undefined}
            className={mobileNavClass("/help")}
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
        </div>}
    </header>
  );
}

export default Navbar;
