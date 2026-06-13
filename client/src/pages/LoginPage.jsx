import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { usePermissionContext } from "../context/PermissionContext";
import { getCompanyName } from "../utils/settings_helper";
import Toast from "../components/ui/Toast";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { fetchPermissions } = usePermissionContext();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/40"
      >
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{getCompanyName()}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Log in to your account</p>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="admin@example.com"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100 mb-4 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900"
        />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter your password"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100 mb-6 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-600 px-4 py-3 text-white font-semibold hover:bg-sky-700 disabled:opacity-60 transition"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </form>

      <Toast message={error} type="error" visible={Boolean(error)} onClose={() => setError("")} />
    </div>
  );
}

export default LoginPage;
