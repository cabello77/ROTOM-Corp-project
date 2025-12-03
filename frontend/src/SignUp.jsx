import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import Header from "./components/Header";

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Submitting...");

    try {
      await signup(formData);
      setFormData({ name: "", email: "", password: "" });
      setMessage("Signup successful!");
      navigate("/user-home");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Signup failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <Header buttons={[
        { path: '/', label: 'Home' }
      ]} />

      {/* Main Sign Up Form */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
          <h1
            className="text-2xl font-bold text-center mb-6"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Sign Up
          </h1>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Username"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 mb-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
              required
            />
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
              className="w-full py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg disabled:opacity-60"
              style={{ 
                fontFamily: "Times New Roman, serif",
                backgroundColor: '#774C30',
                color: 'white'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

            {message && (
              <p
                className={`mt-4 text-center text-sm ${
                  message.includes("success")
                    ? "text-green-600"
                  : message.includes("failed") || message.includes("error")
                  ? "text-red-600"
                  : "text-gray-700"
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

export default SignUp;
