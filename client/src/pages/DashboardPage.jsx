/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import Toast from "../components/ui/Toast";
import StockValueTrendChart from "../components/charts/StockValueTrendChart";
import StockByCategoryChart from "../components/charts/StockByCategoryChart";
import ProductStatusChart from "../components/charts/ProductStatusChart";
import { getDashboardSummary, getDashboardCharts } from "../services/dashboardService";
import { getUser } from "../services/authService";
import usePermission from "../hooks/usePermission";

const moduleColors = {
  products: "bg-blue-100 text-blue-700",
  categories: "bg-violet-100 text-violet-700",
  suppliers: "bg-emerald-100 text-emerald-700",
  users: "bg-rose-100 text-rose-700",
  auth: "bg-slate-100 text-slate-700",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const timeAgo = (dateString) => {
  const diffSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSeconds < 60) return `${diffSeconds} sec ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

function DashboardPage() {
  const user = getUser() || {};
  const { can } = usePermission();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard summary.");
    }
  };

  const loadCharts = async () => {
    try {
      const data = await getDashboardCharts();
      setChartData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard charts.");
    }
  };

  useEffect(() => {
    loadSummary();
    loadCharts();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user.name || "User"}`}
        buttonText="Refresh"
        onButtonClick={() => {
          loadSummary();
          loadCharts();
        }}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <StatCard title="Total Products" value={summary?.totalProducts ?? "--"} color="#2563eb" trend="Items in stock" />
        <StatCard
          title="Low Stock Items"
          value={summary?.lowStockProducts ?? "--"}
          color="#dc2626"
          trend="Needs reorder"
          badge={summary?.lowStockProducts > 0 ? "Warning" : undefined}
        />
        <StatCard title="Total Suppliers" value={summary?.totalSuppliers ?? "--"} color="#16a34a" trend="Active suppliers" />
        <StatCard title="Total Stock Value" value={formatCurrency(summary?.totalStockValue ?? 0)} color="#f59e0b" trend="Inventory value" />
        <StatCard title="Total Categories" value={summary?.totalCategories ?? "--"} color="#2563eb" trend="Active categories" />
        {can("users.view") && (
          <StatCard title="Total Users" value={summary?.totalUsers ?? "--"} color="#7c3aed" trend="Active users" />
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <StockValueTrendChart data={chartData?.stockValueTrend || []} />
        <StockByCategoryChart data={chartData?.stockByCategory || []} />
        <ProductStatusChart data={chartData?.productStatus || []} />
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Latest actions across the inventory system</p>
          </div>
          <button
            type="button"
            onClick={() => {
              loadSummary();
              loadCharts();
            }}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Refresh
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentActivity?.length ? (
                summary.recentActivity.map((item) => (
                  <tr key={item._id} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-4 px-3">{item.action}</td>
                    <td className="py-4 px-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${moduleColors[item.module] || "bg-slate-100 text-slate-700"}`}>
                        {item.module}
                      </span>
                    </td>
                    <td className="py-4 px-3">{item.user?.name || "Unknown"}</td>
                    <td className="py-4 px-3">{timeAgo(item.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 px-3 text-center text-slate-500 dark:text-slate-400">
                    No recent activity available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast message={error} type="error" visible={Boolean(error)} onClose={() => setError("")} />
    </div>
  );
}

export default DashboardPage;
