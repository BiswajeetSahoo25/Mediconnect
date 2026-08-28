import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}

export default AuthLayout;