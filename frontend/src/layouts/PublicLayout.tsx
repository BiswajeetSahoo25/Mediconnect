// import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-blue-800 shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" className="flex-1">
        <div className="public-page-shell">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;
