import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";

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
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Signup failed");
    }
    setIsSubmitting(false);
  };

  const handleSocialSignUp = async (provider) => {
    setMessage(`Redirecting to ${provider}...`);
    // Placeholder for future OAuth integration. For now, just show a friendly message.
    setTimeout(() => {
      setMessage(
        `${provider} sign-in coming soon. Please use email/password while we finish the integration.`
      );
    }, 600);
  };

  const socialProviders = [
    {
      id: "google",
      label: "Continue with Google",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 10.2v3.6h5.09A4.99 4.99 0 0112 20a7.5 7.5 0 010-15c1.87 0 3.58.68 4.9 1.8l2.63-2.63A11.96 11.96 0 0012 0a12 12 0 1012 12c0-.67-.06-1.32-.18-1.95H12z"
          />
        </svg>
      ),
    },
    {
      id: "microsoft",
      label: "Continue with Microsoft",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#F25022" d="M11 11H3V3h8z" />
          <path fill="#00A4EF" d="M21 11h-8V3h8z" />
          <path fill="#7FBA00" d="M11 21H3v-8h8z" />
          <path fill="#FFB900" d="M21 21h-8v-8h8z" />
        </svg>
      ),
    },
    {
      id: "apple",
      label: "Continue with Apple",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18.72 19.05c-.64 1.39-1.27 2.77-2.28 2.79-1 .02-1.32-.9-2.46-.9-1.14 0-1.53.88-2.5.92-1.01.04-1.78-1.5-2.42-2.89C7.69 16.38 7.02 13.05 8.6 11.1c.7-.9 1.8-1.51 2.85-1.53 1.12-.04 2.18.76 2.76.76.58 0 1.96-.94 3.31-.8.56.02 2.13.22 3.14 1.74-.08.05-1.87 1.09-1.85 3.26.02 2.57 2.28 3.42 2.31 3.44-.02.07-.36 1.2-1.2 2.08-.52.55-1.06 1.11-1.8 1.11-.75 0-.98-.36-1.83-.39-.85-.03-1.11.4-1.88.4-.77 0-1.07-.44-1.83-.42-.76.02-1.14.44-1.88.44-.74 0-1.18-.56-1.88-.44-.3.05-.58.22-.83.43"
          />
          <path
            fill="currentColor"
            d="M15.54 4.2c.49-.73.83-1.75.74-2.81-.72.03-1.6.5-2.12 1.12-.46.53-.87 1.55-.76 2.62.81.06 1.65-.45 2.14-1.08z"
          />
        </svg>
      ),
    },
  ];

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

      {/* Main Sign Up Form */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
          <h1
            className="text-2xl font-bold text-center mb-6"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Sign Up
          </h1>

          <div className="space-y-3 mb-6">
            {socialProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleSocialSignUp(provider.label.split(" ")[2])}
                className={`w-full flex items-center justify-center space-x-3 px-4 py-2 border border-gray-300 rounded hover:opacity-80 transition-opacity`}
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#F8F5F1" }}
              >
                <span className="flex-shrink-0 text-gray-700">{provider.icon}</span>
                <span className="text-gray-800 text-sm font-medium">{provider.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span
              className="mx-3 text-xs uppercase tracking-wide text-gray-500"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Or
            </span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
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
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition disabled:opacity-60"
              style={{ fontFamily: "Times New Roman, serif" }}
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
