import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

type IconProps = {
  className?: string;
};

function DashboardIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function DoctorIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20a6 6 0 0 1 12 0" />
      <path d="M17 12h3v3a3 3 0 0 1-6 0v-3h3Z" />
    </svg>
  );
}

function AppointmentIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M8 14h3M8 17h5" />
    </svg>
  );
}

function RecordsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 4h9l3 3v13H6z" />
      <path d="M14 4v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

function ProviderIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${
        collapsed ? "rotate-180" : ""
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    {
      label: "My dashboard",
      path: "/dashboard",
      icon: DashboardIcon,
    },
    {
      label: "Doctors",
      path: "/doctors",
      icon: DoctorIcon,
    },
    {
      label: "Appointments",
      path: "/appointments",
      icon: AppointmentIcon,
    },
    {
      label: "Medical records",
      path: "/records",
      icon: RecordsIcon,
    },
  ];

  const providerNavigation = [
    {
      label: "Apply as doctor",
      path: "/apply-as-doctor",
      icon: ProviderIcon,
    },
    {
      label: "Doctor dashboard",
      path: "/doctor-dashboard",
      icon: DoctorIcon,
    },
  ];

  return (
    <aside
      className={`hidden min-h-[calc(100vh-4.5rem)] shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 md:block ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <nav className="flex h-full flex-col px-3 py-5">
        <div
          className={`mb-5 flex ${
            collapsed ? "justify-center" : "justify-end"
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
        </div>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl py-3 text-sm font-medium transition ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-blue-50 text-[#1a73e8]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />

                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="my-5 border-t border-slate-100" />

        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Provider
            </p>
          )}

          {providerNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl py-3 text-sm font-medium transition ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-blue-50 text-[#1a73e8]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />

                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <Link
            to="/account"
            title={collapsed ? "Account settings" : undefined}
            className={`flex items-center rounded-xl py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          >
            <SettingsIcon className="h-5 w-5 shrink-0" />

            {!collapsed && <span>Account settings</span>}
          </Link>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
