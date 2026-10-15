import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main-content" className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-blue-800 shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>
      <Navbar />

      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1600px]">
        <Sidebar />

        <main id="main-content" className="min-w-0 flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8 xl:px-10">
          <div className="page-shell min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
