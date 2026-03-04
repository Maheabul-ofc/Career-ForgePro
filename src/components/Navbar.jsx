import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          ⚡ CareerForge <span className="text-indigo-400 font-light">Pro</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-slate-300 hover:text-white text-sm">
            Pricing
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm">
                Dashboard
              </Link>
              <Link to="/history" className="text-slate-300 hover:text-white text-sm">
                History
              </Link>
              <span className="text-slate-400 text-sm">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white text-sm">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm gradient-accent text-white px-4 py-1.5 rounded"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
