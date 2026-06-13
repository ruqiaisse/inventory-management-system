/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Toast from "../components/ui/Toast";
import { getSettings, updateSettings } from "../services/settingsService";
import { getUser } from "../services/authService";
import usePermission from "../hooks/usePermission";
import { getErrorMessage } from "../utils/api_helper";
import { setCompanyName } from "../utils/settings_helper";

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "SOS", label: "SOS (Sh)" },
];

function SettingsPage() {
  const user = getUser() || {};
  const { can } = usePermission();

  const [settings, setSettings] = useState({
    companyName: "",
    currency: "USD",
    lowStockThreshold: 10,
    allowRegistration: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      const currentCompanyName = data.companyName || "InvenPro";
      setSettings({
        companyName: currentCompanyName,
        currency: data.currency || "USD",
        lowStockThreshold: data.lowStockThreshold ?? 10,
        allowRegistration: data.allowRegistration ?? true,
      });
      setCompanyName(currentCompanyName);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(settings);
      setCompanyName(settings.companyName || "InvenPro");
      setToast({ message: "Settings saved successfully", type: "success", visible: true });
      setError("");
    } catch (err) {
      const errorMessage = getErrorMessage(err) || "Failed to save settings.";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error", visible: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Review and manage system settings" />

      {!can("settings.update") && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
          You don't have permission to change settings.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              disabled={!can("settings.update") || loading}
              placeholder="InvenPro Ltd"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              disabled={!can("settings.update") || loading}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none"
            >
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Low Stock Threshold</label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => handleChange("lowStockThreshold", Number(e.target.value))}
              disabled={!can("settings.update") || loading}
              placeholder="10"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">Products with stock below this number will be flagged.</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleChange("allowRegistration", e.target.checked)}
                disabled={!can("settings.update") || loading}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Allow new users to self-register
            </label>
          </div>
        </div>

        {can("settings.update") && (
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={() => setToast((prev) => ({ ...prev, visible: false }))} />
    </div>
  );
}

export default SettingsPage;
