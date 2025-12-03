import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";

export default function UserDropdown({ onEditProfile }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [previousLocation, setPreviousLocation] = useState("/user-home");

  // Determine username safely
  const username = user?.profile?.username || user?.name;

  // Track location changes
  useEffect(() => {
    if (location.pathname !== "/user-home/edit") {
      setPreviousLocation(location.pathname);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEditProfile = () => {
    if (onEditProfile) onEditProfile(previousLocation);
  };

  const avatarSrc = user?.profile?.profilePicture;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  const avatarUrl = avatarSrc
    ? (avatarSrc.startsWith("http://") || avatarSrc.startsWith("https://")
        ? avatarSrc
        : `${API_BASE}${avatarSrc}`)
    : null;

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/20 flex items-center justify-center">
              <span
                className="text-white font-bold text-sm"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </div>

      <div className="relative group">
        <button
          type="button"
          className="flex items-center space-x-1 text-white hover:text-gray-200 transition-colors"
        >
          <span
            className="text-sm font-medium"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            {username} {/* username only, no @ */}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* DROPDOWN MENU */}
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <Link
              to="/user-home"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>

            <Link
              to="/notifications"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Notifications</span>
            </Link>

            <button
              type="button"
              onClick={handleEditProfile}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
