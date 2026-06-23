import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass =
    "text-navbar-text transition-colors duration-200 hover:text-navbar-hover";

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-navbar px-8 py-4 shadow-md">
      <div className="text-xl font-bold">
        <Link to="/" className="text-white no-underline">
          Short.ly
        </Link>
      </div>
      <ul className="m-0 flex list-none gap-6 p-0">
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/dashboard" className={linkClass}>
                Dashboard
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className={`${linkClass} cursor-pointer border-none bg-transparent p-0 font-inherit`}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={linkClass}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className={linkClass}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
