import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import Toast from "../components/ui/Toast";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email: normalizedEmail });
      setMessage(response.message || "If that email exists, a reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl p-8 theme-card shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/40">
        <h1 className="text-3xl font-semibold theme-text-primary mb-2">Forgot Password</h1>
        <p className="theme-text-secondary mb-8">Enter your account email and we’ll send a reset link.</p>

        <label className="block text-sm font-medium theme-text-primary mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full theme-input mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full theme-btn-primary"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && <p className="mt-4 text-sm theme-text-success">{message}</p>}
        {error && <p className="mt-4 text-sm theme-text-danger">{error}</p>}

        <div className="mt-6 text-center text-sm theme-text-secondary">
          <button type="button" onClick={() => navigate("/login")} className="text-sky-600 hover:underline" style={{ color: "var(--color-primary)" }}>
            Back to login
          </button>
        </div>
      </form>

      <Toast message={error || message} type={error ? "error" : "success"} visible={Boolean(error || message)} onClose={() => { setError(""); setMessage(""); }} />
    </div>
  );
}

export default ForgotPasswordPage;
