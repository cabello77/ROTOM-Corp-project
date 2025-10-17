import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import mockUserData from "./data/mockUserData";

function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = () => {
    // Allow local demo without hitting the backend or database
    login(mockUserData);
    setMessage("Loaded local demo user");
    navigate("/profile");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await axios.post("/api/login", formData);
      console.log("Login response:", res.data);
      setMessage(res.data.message);
      setFormData({ email: "", password: "" });
      if (res.data?.message?.toLowerCase().includes("successful")) {
        // Store user data in context
        console.log("Storing user data:", res.data.user);
        login(res.data.user);
        console.log("Navigating to profile...");
        // Navigate to the user's profile page after successful login
        navigate("/profile");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

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

      {/* Login Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6" style={{ fontFamily: "Times New Roman, serif" }}>
            Login
          </h1>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 mb-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 mb-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded transition mt-3 border border-gray-300"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Use Demo Account
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes("successful")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {message}
            </p>
          )}
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

export default Login;
