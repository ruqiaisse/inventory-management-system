/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Package, AlertTriangle, Truck, DollarSign, Users, Users2 } from "lucide-react";
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
  products: "theme-badge theme-badge-info",
  categories: "theme-badge theme-badge-primary",
  suppliers: "theme-badge theme-badge-success",
  users: "theme-badge theme-badge-warning",
  auth: "theme-badge theme-badge-muted",
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

  useEffect(() => {
    document.title = "Dashboard — InvenPro";
  }, []);
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

      {/* Stat Cards - All in One Line */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value={summary?.totalProducts ?? "--"}
          color="#2563eb"
          trend="Items in stock"
          icon={Package}
        />
        <StatCard
          title="Low Stock Items"
          value={summary?.lowStockProducts ?? "--"}
          color="#dc2626"
          trend="Needs reorder"
          icon={AlertTriangle}
          badge={summary?.lowStockProducts > 0 ? "Warning" : undefined}
        />
        <StatCard
          title="Total Suppliers"
          value={summary?.totalSuppliers ?? "--"}
          color="#16a34a"
          trend="Active suppliers"
          icon={Truck}
        />
        <StatCard
          title="Total Stock Value"
          value={formatCurrency(summary?.totalStockValue ?? 0)}
          color="#f59e0b"
          trend="Inventory value"
          icon={DollarSign}
        />
        <StatCard
          title="Total Customers"
          value={summary?.totalCustomers ?? "--"}
          color="#7c3aed"
          trend="Active customers"
          icon={Users2}
        />
        {can("users.view") && (
          <StatCard
            title="Total Users"
            value={summary?.totalUsers ?? "--"}
            color="#0ea5e9"
            trend="Active users"
            icon={Users}
          />
        )}
      </div>

      {/* Charts - Same Size and Professional Styling */}
     
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        <div className="theme-card p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden" style={{ borderRadius: "1.5rem" }}>
          <div className="w-full" style={{ height: "400px", backgroundColor: "var(--card-bg)" }}>
            <StockValueTrendChart data={chartData?.stockValueTrend || []} />
          </div>
        </div>
        <div className="theme-card p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden" style={{ borderRadius: "1.5rem" }}>
          <div className="w-full" style={{ height: "400px", backgroundColor: "var(--card-bg)" }}>
            <StockByCategoryChart data={chartData?.stockByCategory || []} />
          </div>
        </div>
        <div className="theme-card p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden" style={{ borderRadius: "1.5rem" }}>
          <div className="w-full" style={{ height: "400px", backgroundColor: "var(--card-bg)" }}>
            <ProductStatusChart data={chartData?.productStatus || []} />
          </div>
        </div>
      </div>

      {/* Recent Sales Section */}
      <div className="theme-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold theme-text-primary">Recent Sales</h2>
            <p className="text-sm theme-text-secondary">Latest sales transactions</p>
          </div>
          <button
            type="button"
            onClick={() => {
              loadSummary();
              loadCharts();
            }}
            className="theme-btn-primary"
          >
            Refresh
          </button>
        </div>

        {error && <p className="text-sm theme-text-danger mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="theme-table">
            <thead className="theme-table-header">
              <tr>
                <th className="py-3 px-3">Invoice</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentSales?.length ? (
                summary.recentSales.map((sale) => (
                  <tr key={sale._id} className="theme-table-row">
                    <td className="py-4 px-3 theme-text-primary">{sale.invoiceNumber || "-"}</td>
                    <td className="py-4 px-3 theme-text-primary">{sale.customer?.name || "Walk-in"}</td>
                    <td className="py-4 px-3 theme-text-primary">{sale.items?.length || 0}</td>
                    <td className="py-4 px-3 theme-text-primary">{formatCurrency(sale.totalAmount)}</td>
                    <td className="py-4 px-3">
                      <span className={sale.status === "completed" ? "theme-badge theme-badge-success" : "theme-badge theme-badge-danger"}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 theme-text-secondary">{timeAgo(sale.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 px-3 text-center theme-text-secondary">
                    No recent sales available.
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