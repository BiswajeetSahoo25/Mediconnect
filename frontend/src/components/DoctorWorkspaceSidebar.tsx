import { Link, useLocation } from "react-router-dom";

const workspaceLinks = [
  { label: "Overview", path: "/doctor-dashboard", icon: "overview" },
  {
    label: "Appointments",
    path: "/doctor-dashboard/appointments",
    icon: "appointments",
  },
  {
    label: "Professional profile",
    path: "/doctor-dashboard/profile",
    icon: "profile",
  },
];

function DoctorWorkspaceSidebar() {
  const location = useLocation();

  return (
    <>
      <nav
        aria-label="Doctor workspace"
        className="flex w-full gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 md:hidden"
      >
        {workspaceLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-current={location.pathname === item.path ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              location.pathname === item.path
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <aside className="hidden min-h-[calc(100vh-4.5rem)] w-64 shrink-0 border-r border-slate-200 bg-white md:block">
        <nav aria-label="Doctor workspace" className="px-3 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Professional workspace
          </p>
          <div className="space-y-1">
            {workspaceLinks.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span aria-hidden="true" className="w-5 text-center">
                    {item.icon === "overview" ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="mx-auto h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="4" y="4" width="6" height="6" rx="1" />
                        <rect x="14" y="4" width="6" height="6" rx="1" />
                        <rect x="4" y="14" width="6" height="6" rx="1" />
                        <rect x="14" y="14" width="6" height="6" rx="1" />
                      </svg>
                    ) : item.icon === "profile" ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="mx-auto h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <circle cx="12" cy="8" r="3.25" />
                        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="mx-auto h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="4" y="5" width="16" height="15" rx="2" />
                        <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5" />
                      </svg>
                    )}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}

export default DoctorWorkspaceSidebar;
