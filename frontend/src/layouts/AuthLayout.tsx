import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main id="main-content" className="min-h-screen">
      <Outlet />
    </main>
  );
}

export default AuthLayout;
