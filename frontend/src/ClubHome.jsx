import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useUser } from "./contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function ClubHome() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading, logout } = useUser();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs/${id}`);
        setClub(res.data);
      } catch (error) {
        console.error("Error loading club:", error);
      }
    };
    fetchClub();
  }, [id]);

  const avatarSrc = useMemo(() => {
    const path = user?.profile?.profilePicture;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  }, [user?.profile?.profilePicture]);

  const memberSince = user?.profile?.joinDate
    ? new Date(user.profile.joinDate).toLocaleDateString()
    : "—";

  if (isLoading || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <p className="text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      {/* Header */}
      <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
              Plotline
            </div>
            <div className="flex space-x-3">
              <Link
                to="/profile"
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
              >
                Profile
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="h-1 bg-blue-400"></div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Center column for club content */}
          <section className="lg:col-span-9 space-y-6">
            <div className="bg-white shadow-md rounded-lg p-8">
              <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                {club.name}
              </h2>
              <p className="text-gray-700 mb-6" style={{ fontFamily: "Times New Roman, serif" }}>
                {club.description || "No description provided."}
              </p>
              <hr className="mb-4 border-gray-300" />
              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                Created by: <span className="font-semibold">{club.creator?.name || "Unknown"}</span>
              </p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                Created on: {new Date(club.createdAt).toLocaleDateString()}
              </p>
            </div>
          </section>

          {/* Right sidebar — profile info reused */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Profile Summary Card */}
            <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#d7c4a9] h-20 relative">
                <div className="absolute left-6 -bottom-10 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                      <span className="text-2xl text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 pt-12 pb-6 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Times New Roman, serif" }}>
                    {user.email}
                  </p>
                </div>
                <div className="text-sm text-gray-600 space-y-1" style={{ fontFamily: "Times New Roman, serif" }}>
                  <p>Member since — {memberSince}</p>
                  <p>{user.profile?.bio || "Add a bio to let other readers know what you love."}</p>
                </div>
              </div>
            </div>

            {/* My Bookshelf & Logout */}
            <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
              <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                My Bookshelf
              </h3>
              <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                Track books to build your shelf.
              </p>
              <button
                type="button"
                className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Update Shelf
              </button>
            </div>

            <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
              <button
                type="button"
                onClick={() => { logout(); navigate("/"); }}
                className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
