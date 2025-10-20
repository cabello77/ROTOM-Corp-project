import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "./contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function ClubCreate() {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("You must be logged in to create a club.");
      return;
    }

    if (!name.trim()) {
      setError("Club name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_BASE}/api/clubs`, {
        name,
        description,
        creatorId: user.id,
      });

      // Redirect to the new club page
      navigate(`/clubs/${res.data.club.id}`);
    } catch (err) {
      console.error("❌ Error creating club:", err);
      setError(err.response?.data?.error || "Failed to create club.");
    } finally {
      setLoading(false);
    }
  };

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
              <button
                onClick={() => navigate(-1)}
                className="text-gray-800 px-4 py-2 rounded border border-gray-400 hover:opacity-80 transition-opacity"
                style={{
                  fontFamily: "Times New Roman, serif",
                  backgroundColor: "#D9D9D9",
                }}
              >
                Back
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-blue-400"></div>
      </header>

      {/* Main Form */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
          <h2
            className="text-3xl font-semibold mb-6 text-center text-[#774C30]"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Create a New Book Club
          </h2>

          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 mb-1"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Club Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F93D6]"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                placeholder="Enter a unique club name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-gray-700 mb-1"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F93D6]"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                rows="4"
                placeholder="What is your book club about?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-lg transition"
              style={{
                backgroundColor: loading ? "#9B8265" : "#8B5E3C",
                fontFamily: "Times New Roman, serif",
              }}
            >
              {loading ? "Creating..." : "Create Club"}
            </button>
          </form>
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
