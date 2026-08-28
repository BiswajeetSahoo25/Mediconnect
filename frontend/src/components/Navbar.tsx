import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold">
          Mediconnect
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm">
            Home
          </Link>

          <Link to="/login" className="text-sm">
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-lg px-4 py-2 text-sm font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
