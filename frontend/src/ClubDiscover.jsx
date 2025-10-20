import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import SidebarProfile from "./components/SidebarProfile";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function ClubDiscover() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/clubs`);
        const data = await res.json();
        console.log("Fetched clubs data:", data);

        if (Array.isArray(data)) {
          // Sort alphabetically by name
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setClubs(sorted);
        } else if (data && Array.isArray(data.clubs)) {
          const sorted = [...data.clubs].sort((a, b) => a.name.localeCompare(b.name));
          setClubs(sorted);
        } else {
          setClubs([]);
        }
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p
            className="text-gray-600"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Loading clubs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <header className="text-white" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div
              className="text-6xl md:text-8xl italic"
              style={{ fontFamily: "Kapakana, cursive" }}
            >
              Plotline
            </div>
            <div className="space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity"
                style={{
                  fontFamily: "Times New Roman, serif",
                  backgroundColor: "#D9D9D9",
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity"
                style={{
                  fontFamily: "Times New Roman, serif",
                  backgroundColor: "#D9D9D9",
                }}
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
        <div className="h-1 bg-blue-400" />
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Discover Clubs Section */}
          <section className="lg:col-span-9">
            <h1
              className="text-3xl font-semibold text-center mb-8"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Discover Book Clubs
            </h1>

            {clubs.length === 0 ? (
              <p
                className="text-center text-gray-600"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                No clubs found yet. Be the first to create one!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 flex flex-col justify-between"
                  >
                    <div>
                      <h2
                        className="text-xl font-semibold mb-2"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {club.name}
                      </h2>
                      <p
                        className="text-sm text-gray-600 mb-3"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {club.description || "No description available."}
                      </p>
                    </div>
                    <div
                      className="mt-2 text-sm text-gray-500"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      Created by:{" "}
                      <strong>{club.creator?.name || "Unknown"}</strong>
                      <br />
                      {new Date(club.createdAt).toLocaleDateString()}
                    </div>
                    <Link
                      to={`/clubs/${club.id}`}
                      className="mt-4 text-center px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      View Club
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: Sidebar */}
          <SidebarProfile />
        </div>
      </main>
    </div>
  );
}

export default ClubDiscover;
