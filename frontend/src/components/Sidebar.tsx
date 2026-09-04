import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Doctors",
      path: "/doctors",
    },
    {
      label: "Appointments",
      path: "/appointments",
    },
    {
      label: "Medical Records",
      path: "/records",
    },
  ];

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-slate-200 bg-white md:block">
      <nav className="flex h-full flex-col p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
