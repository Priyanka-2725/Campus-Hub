import { Bell, LayoutDashboard, LogIn } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../api/axios";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";

const navLinkClass = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive ? "bg-white text-pine shadow-sm" : "text-slate-600 hover:text-slate-900",
  ].join(" ");

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotificationCount(0);
      return;
    }

    let mounted = true;

    notificationApi
      .getAll()
      .then(({ data }) => {
        if (mounted) {
          setNotificationCount(data.filter((notification) => !notification.isRead).length);
        }
      })
      .catch(() => {
        if (mounted) {
          setNotificationCount(0);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-cream/85 px-6 py-4 backdrop-blur sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/80 bg-white/70 px-4 py-3 shadow-card">
        <div className="flex items-center gap-5">
          <BrandLogo to="/" size={44} className="scale-[0.78] origin-left sm:scale-100" />

          <nav className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/marketplace" className={navLinkClass}>
                  Marketplace
                </NavLink>
                <NavLink to="/chat" className={navLinkClass}>
                  Chat
                </NavLink>
                <NavLink to="/events" className={navLinkClass}>
                  Events
                </NavLink>
                <NavLink to="/collaboration" className={navLinkClass}>
                  Collab
                </NavLink>
              <NavLink to="/notifications" className={navLinkClass}>
                Notifications
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </>
          ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm text-slate-600 sm:flex">
                <Bell size={16} className="text-clay" />
                <Link to="/profile" className="font-medium hover:text-pine">
                  {user?.name || "Student"}
                </Link>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-clay px-4 py-2 text-sm font-semibold text-clay"
              >
                <LogIn size={16} />
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white"
              >
                <LayoutDashboard size={16} />
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
