import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import Toast from "../components/ui/Toast";

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword(token, { newPassword: password });
      setMessage(response.message || "Your password has been reset.");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl p-8 theme-card shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/40">
        <h1 className="text-3xl font-semibold theme-text-primary mb-2">Reset Password</h1>
        <p className="theme-text-secondary mb-8">Create a new password for your account.</p>

        <label className="block text-sm font-medium theme-text-primary mb-2">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full theme-input mb-4"
        />

        <label className="block text-sm font-medium theme-text-primary mb-2">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full theme-input mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full theme-btn-primary"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {message && <p className="mt-4 text-sm theme-text-success">{message}</p>}
        {error && <p className="mt-4 text-sm theme-text-danger">{error}</p>}

        <div className="mt-6 text-center text-sm theme-text-secondary">
          <button type="button" onClick={() => navigate("/login")} className="hover:underline" style={{ color: "var(--color-primary)" }}>
            Back to login
          </button>
        </div>
      </form>

      <Toast message={error || message} type={error ? "error" : "success"} visible={Boolean(error || message)} onClose={() => { setError(""); setMessage(""); }} />
    </div>
  );
}

export default ResetPasswordPage;
