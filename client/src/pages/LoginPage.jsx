import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { usePermissionContext } from "../context/PermissionContext";
import { getCompanyName } from "../utils/settings_helper";
import Toast from "../components/ui/Toast";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { fetchPermissions } = usePermissionContext();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await loginUser(formData);
      await fetchPermissions();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const companyName = getCompanyName();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-tertiary)" }}
    >
      <div
        className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: "var(--card-bg)",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border-color)",
        }}
      >
        {/* Decorative branding panel */}
        <div
          className="relative hidden md:flex flex-col items-center justify-center p-12 overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute rounded-full"
            style={{
              width: "340px",
              height: "340px",
              top: "-80px",
              left: "-100px",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "220px",
              height: "220px",
              bottom: "-60px",
              right: "-60px",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "120px",
              height: "120px",
              bottom: "40px",
              left: "-40px",
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />

          {/* Logo + name */}
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div
              className="flex items-center justify-center w-40 h-40 rounded-2xl text-6xl"
              style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
            >
              📦
            </div>
            <h1 className="text-3xl font-bold text-white">{companyName}</h1>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm">
            {/* Logo shown only on small screens, where the branding panel is hidden */}
            <div className="flex md:hidden items-center justify-center mb-6">
              <div
                className="flex items-center justify-center w-24 h-24 rounded-2xl text-4xl"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                📦
              </div>
            </div>

            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold mb-4 px-3 py-2 rounded-full transition-all duration-300 hover:opacity-80"
                style={{
                  color: "var(--color-primary)",
                  backgroundColor: "rgba(59, 158, 245, 0.08)",
                  border: "1px solid rgba(59, 158, 245, 0.18)",
                }}
              >
                <span className="text-base">←</span>
                <span>Back to Home</span>
              </Link>
              <h2
                className="text-2xl font-bold mb-1 transition-colors duration-300"
                style={{ color: "var(--text-primary)" }}
              >
                Welcome back
              </h2>
              <p
                className="text-sm transition-colors duration-300"
                style={{ color: "var(--text-secondary)" }}
              >
                Please enter your credentials to sign in
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{ color: "var(--text-primary)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@example.com"
                  disabled={loading}
                  className="w-full rounded-lg px-4 py-3 text-sm font-medium outline-none transition-all duration-300"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--input-text)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--input-focus-border)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--input-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{ color: "var(--text-primary)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full rounded-lg px-4 py-3 text-sm font-medium outline-none transition-all duration-300 pr-12"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--input-text)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--input-focus-border)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--input-border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200 hover:opacity-70 p-1 flex items-center justify-center"
                    style={{ color: "var(--text-secondary)" }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {showPassword ? (
                        // Eye icon (visible)
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        // Eye with slash (hidden)
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded transition-colors duration-300"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      borderColor: "var(--input-border)",
                    }}
                  />
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Remember this device
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: "var(--color-primary)" }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = "1";
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg px-4 py-3 text-white font-semibold transition-all duration-300 mt-6"
                style={{
                  backgroundColor: "var(--color-primary)",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.filter = "brightness(0.9)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.filter = "brightness(1)";
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      <Toast
        message={error}
        type="error"
        visible={Boolean(error)}
        onClose={() => setError("")}
      />
    </div>
  );
}

export default LoginPage;