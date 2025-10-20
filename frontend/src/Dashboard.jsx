import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./contexts/UserContext";
import axios from "axios";


function Dashboard() {
  const { user, isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]); // 🆕 state for user's clubs
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${user.id}/clubs`);
        if (!res.ok) throw new Error("Failed to fetch clubs");
        const data = await res.json();
        setClubs(data);
      } catch (err) {
        console.error("Error fetching user clubs:", err);
      }
    };
    if (user?.id) fetchClubs();
  }, [user?.id]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (do it in an effect to avoid navigating during render)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <header className="text-white" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
              Plotline
            </div>
            <div className="space-x-4">
              <Link
                to="/profile"
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
              >
                Profile
              </Link> 
              <Link
                to="/"
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
              >
                Home
              </Link>
            </div>
          </div>
        </div>
        <div className="h-1 bg-blue-400"></div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-start px-4 py-10">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Welcome to your Dashboard, {user?.name || "User"}!
          </h1>
          <p
            className="text-gray-600 mb-6"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Manage your profile and explore your book clubs.
          </p>

          {/* Updated View Profile button */}
          <Link
            to="/profile"
            className="text-gray-800 px-6 py-3 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-lg"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            View Profile
          </Link>

        </div>

        {/* My Book Clubs Section */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
          <h2
            className="text-2xl font-semibold text-center mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            My Book Clubs
          </h2>

          {clubs.length > 0 ? (
            <div className="space-y-3">
              {clubs.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="block text-center px-4 py-2 rounded border border-[#e6dac8] bg-[#faf6ed] hover:bg-[#efe5d5] transition-colors"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {club.name}
                </Link>
              ))}
            </div>
          ) : (
            <p
              className="text-center text-gray-600"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              You haven’t created any book clubs yet.
            </p>
          )}

          {/* Updated Create New Club button */}
          <div className="text-center mt-4">
            <Link
              to="/clubs/new"
              className="block text-center w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              + Create a New Club
            </Link>
          </div>
        </div>
      </main>



      {/* Footer */}
      <footer className="text-white py-8" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p style={{ fontFamily: "Times New Roman, serif" }}>
            &copy; 2025 Plotline brought to you by ROTOM Corporation
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
