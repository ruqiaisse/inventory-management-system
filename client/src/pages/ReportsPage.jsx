import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Toast from "../components/ui/Toast";
import { exportReport } from "../services/reportService";
import usePermission from "../hooks/usePermission";
import { getToken } from "../utils/api_helper";

const TABS = [
  { id: "products", label: "Products", hasDateFilter: true },
  { id: "stock", label: "Stock", hasDateFilter: false },
  { id: "categories", label: "Categories", hasDateFilter: false },
  { id: "suppliers", label: "Suppliers", hasDateFilter: false },
  { id: "activity", label: "Activity", hasDateFilter: true },
];

const COLUMNS = {
  products: [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "stock", label: "Stock" },
    { key: "minStock", label: "Min Stock" },
    { key: "price", label: "Price" },
    { key: "status", label: "Status" },
  ],
  stock: [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "stock", label: "Current Stock" },
    { key: "minStock", label: "Min Stock" },
    { key: "price", label: "Price" },
    { key: "status", label: "Status" },
  ],
  categories: [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "count", label: "Product Count" },
    { key: "status", label: "Status" },
  ],
  suppliers: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "count", label: "Product Count" },
    { key: "status", label: "Status" },
  ],
  activity: [
    { key: "date", label: "Date" },
    { key: "action", label: "Action" },
    { key: "module", label: "Module" },
    { key: "user", label: "User" },
    { key: "details", label: "Details" },
  ],
};

function ReportsPage() {
  const { can } = usePermission();
  const [activeTab, setActiveTab] = useState("products");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentTab = TABS.find((tab) => tab.id === activeTab);
  const hasDateFilter = currentTab?.hasDateFilter;

  // Helper function to filter data by date range
  const filterByDate = (items, dateKey = "createdAt") => {
    if (!fromDate && !toDate) return items;
    
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    to?.setHours(23, 59, 59, 999);
    
    return items.filter((item) => {
      const itemDate = item[dateKey] ? new Date(item[dateKey]) : new Date();
      if (from && itemDate < from) return false;
      if (to && itemDate > to) return false;
      return true;
    });
  };

  // Fetch report data from existing APIs
  const loadReportData = async () => {
    try {
      setError("");
      setLoading(true);

      const token = getToken();
      if (!token) {
        setError("Authentication required. Please log in again.");
        setReportData([]);
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      let data = [];

      if (activeTab === "products") {
        const response = await fetch("/api/products", { headers });
        if (!response.ok) throw new Error("Failed to fetch products");
        const result = await response.json();
        const products = result.data || result || [];
        
        data = products.map((product) => ({
          sku: product.sku,
          name: product.name,
          category: product.category?.name || "-",
          stock: product.stock,
          minStock: product.minStock,
          price: `$${parseFloat(product.price || 0).toFixed(2)}`,
          status:
            product.stock === 0
              ? "Out of Stock"
              : product.stock <= product.minStock
              ? "Low Stock"
              : "In Stock",
          createdAt: product.createdAt,
        }));

        // Filter by date if provided
        data = filterByDate(data, "createdAt");
      } else if (activeTab === "stock") {
        const response = await fetch("/api/products", { headers });
        if (!response.ok) throw new Error("Failed to fetch products");
        const result = await response.json();
        const products = result.data || result || [];
        
        data = products.map((product) => ({
          name: product.name,
          category: product.category?.name || "-",
          stock: product.stock,
          minStock: product.minStock,
          price: `$${parseFloat(product.price || 0).toFixed(2)}`,
          status:
            product.stock === 0
              ? "Out of Stock"
              : product.stock <= product.minStock
              ? "Low Stock"
              : "In Stock",
        }));
      } else if (activeTab === "categories") {
        const response = await fetch("/api/categories", { headers });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const result = await response.json();
        const categories = result.data || result || [];
        
        // Get categories with product count
        const categoriesPromise = categories.map(async (category) => {
          try {
            const productsRes = await fetch(`/api/products?category=${category._id}`, { headers });
            const productsResult = await productsRes.json();
            const count = (productsResult.data || []).length;
            return {
              name: category.name,
              description: category.description || "-",
              count: count,
              status: category.isActive ? "Active" : "Inactive",
            };
          } catch (err) {
            console.error(`Error fetching products for category ${category._id}:`, err);
            return {
              name: category.name,
              description: category.description || "-",
              count: 0,
              status: category.isActive ? "Active" : "Inactive",
            };
          }
        });
        
        data = await Promise.all(categoriesPromise);
      } else if (activeTab === "suppliers") {
        const response = await fetch("/api/suppliers", { headers });
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const result = await response.json();
        const suppliers = result.data || result || [];
        
        // Get suppliers with product count
        const suppliersPromise = suppliers.map(async (supplier) => {
          try {
            const productsRes = await fetch(`/api/products?supplier=${supplier._id}`, { headers });
            const productsResult = await productsRes.json();
            const count = (productsResult.data || []).length;
            return {
              name: supplier.name,
              email: supplier.email || "-",
              phone: supplier.phone || "-",
              count: count,
              status: supplier.isActive ? "Active" : "Inactive",
            };
          } catch (err) {
            console.error(`Error fetching products for supplier ${supplier._id}:`, err);
            return {
              name: supplier.name,
              email: supplier.email || "-",
              phone: supplier.phone || "-",
              count: 0,
              status: supplier.isActive ? "Active" : "Inactive",
            };
          }
        });
        
        data = await Promise.all(suppliersPromise);
      } else if (activeTab === "activity") {
        const response = await fetch("/api/activity", { headers });
        if (!response.ok) throw new Error("Failed to fetch activity logs");
        const result = await response.json();
        const logs = result.data || result || [];
        
        data = logs
          .map((log) => ({
            date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "-",
            action: log.action || "-",
            module: log.module || "-",
            user: log.user?.name || log.userId || "Unknown",
            details: log.details || "-",
            createdAt: log.createdAt,
          }))
          .reverse(); // Newest first

        // Filter by date if provided
        data = filterByDate(data, "createdAt");
      }

      setReportData(data);
    } catch (err) {
      console.error("Error loading report:", err);
      setError(err.message || "Unable to load report data.");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when activeTab, fromDate, or toDate changes
  useEffect(() => {
    loadReportData();
  }, [activeTab, fromDate, toDate]);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setError("");
      await exportReport(activeTab, format, { fromDate, toDate });
      setSuccess(`${activeTab} report downloaded successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with PageHeader and Export Buttons */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <PageHeader title="Reports" subtitle="View and export reports" />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting || !can("reports.export")}
            className="rounded-2xl bg-rose-500 px-6 py-2 text-sm font-medium text-white hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {exporting ? "Exporting..." : "PDF"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting || !can("reports.export")}
            className="rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {exporting ? "Exporting..." : "Excel"}
          </button>
        </div>
      </div>

      {/* Tabs and Content Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-4 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-sky-500 text-sky-600 dark:text-sky-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {/* Filters */}
          {hasDateFilter && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Date Range</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">From Date</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">To Date</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    onClick={loadReportData}
                    className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Apply Filter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!hasDateFilter && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This report auto-loads and updates when the tab is switched.
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950 p-4 text-sm text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}

          {/* Data Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Data ({reportData.length} records)
            </h3>

            {!error && reportData.length === 0 && !loading && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No data available. {hasDateFilter && "Try adjusting the date range."}
              </div>
            )}

            {loading && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading data...
              </div>
            )}

            {reportData.length > 0 && !loading && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      {COLUMNS[activeTab].map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition"
                      >
                        {COLUMNS[activeTab].map((col) => {
                          let value = row[col.key];

                          // Format status badges
                          if (col.key === "status") {
                            const statusColors = {
                              "In Stock": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
                              "Low Stock": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
                              "Out of Stock": "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
                              Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
                              Inactive: "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-200",
                            };

                            return (
                              <td key={col.key} className="px-4 py-3">
                                <span
                                  className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                                    statusColors[value] || "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {value}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={col.key} className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {value || "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!can("reports.export") && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-800 dark:text-amber-200">
              You do not have permission to export reports.
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {(error || success) && (
        <Toast
          message={error || success}
          type={error ? "error" : "success"}
          visible={Boolean(error || success)}
          onClose={() => {
            setError("");
            setSuccess("");
          }}
        />
      )}
    </div>
  );
}

export default ReportsPage;