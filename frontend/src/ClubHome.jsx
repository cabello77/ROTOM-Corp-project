import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./contexts/UserContext";
import SidebarProfile from "./components/SidebarProfile";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function ClubHome() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch club data
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

  // Handle delete club (only creator can do this)
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this club? This cannot be undone.")) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE}/api/clubs/${club.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Club deleted successfully.");
        navigate("/dashboard");
      } else {
        alert(data.error || "Failed to delete club.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting club.");
    } finally {
      setDeleting(false);
    }
  };

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
              <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                Created on: {new Date(club.createdAt).toLocaleDateString()}
              </p>

              {/* Show Delete Button if current user is creator */}
              {user && user.id === club.creatorId && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="mt-2 w-full text-white px-4 py-2 rounded border border-[#ddcdb7] hover:opacity-90 transition"
                  style={{
                    backgroundColor: "#774C30",
                    fontFamily: "Times New Roman, serif",
                    cursor: deleting ? "not-allowed" : "pointer",
                  }}
                >
                  {deleting ? "Deleting..." : "Delete Club"}
                </button>
              )}
            </div>
          </section>

          {/* Right sidebar (using reusable SidebarProfile component) */}
          <aside className="lg:col-span-3">
            <SidebarProfile />
          </aside>
        </div>
      </main>
    </div>
  );
}
