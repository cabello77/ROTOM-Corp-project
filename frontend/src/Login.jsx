import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import Header from "./components/Header";

function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Logging in...");

    try {
      await login(formData.email, formData.password);
      setFormData({ email: "", password: "" });
      setMessage("Login successful!");
      navigate("/user-home");
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.message || "Login failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <Header buttons={[
        { path: '/', label: 'Home' }
      ]} />

      {/* Login Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6" style={{}}>
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
              style={{}}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 mb-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{}}
              required
            />

            <button
              type="submit"
              className="w-full py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg disabled:opacity-60"
              style={{backgroundColor: '#774C30',
                color: 'white'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes("successful")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              style={{}}
            >
              {message}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-8" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p style={{}}>
            &copy; 2025 Plotline brought to you by ROTOM Corporation
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Login;
