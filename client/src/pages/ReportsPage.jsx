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
  { id: "sales", label: "Sales Report", hasDateFilter: true },
  { id: "customers", label: "Customer Report", hasDateFilter: true },
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
  sales: [
    { key: "invoiceNumber", label: "Invoice" },
    { key: "customer", label: "Customer" },
    { key: "items", label: "Items" },
    { key: "totalAmount", label: "Total" },
    { key: "paymentMethod", label: "Payment" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
  ],
  customers: [
    { key: "customerCode", label: "Code" },
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
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

  const normalizeResponseArray = (result) => {
    if (Array.isArray(result)) return result;
    if (result?.data) return result.data;
    return [];
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
        const categories = normalizeResponseArray(result);
        
        // Get categories with product count
        const categoriesPromise = categories.map(async (category) => {
          try {
            const productsRes = await fetch(`/api/products?category=${category._id}`, { headers });
            const productsResult = await productsRes.json();
            const products = normalizeResponseArray(productsResult);
            const count = products.length;
            return {
              name: category.name,
              description: category.description || "-",
              count,
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
        const suppliers = normalizeResponseArray(result);
        
        // Get suppliers with product count
        const suppliersPromise = suppliers.map(async (supplier) => {
          try {
            const productsRes = await fetch(`/api/products?supplier=${supplier._id}`, { headers });
            const productsResult = await productsRes.json();
            const products = normalizeResponseArray(productsResult);
            const count = products.length;
            return {
              name: supplier.name,
              email: supplier.email || "-",
              phone: supplier.phone || "-",
              count,
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
      } else if (activeTab === "sales") {
        const response = await fetch("/api/sales", { headers });
        if (!response.ok) throw new Error("Failed to fetch sales");
        const result = await response.json();
        const sales = result.sales || result.data || result || [];

        data = sales.map((sale) => ({
          invoiceNumber: sale.invoiceNumber || "-",
          customer: sale.customer?.name || sale.customer || "-",
          items: sale.items?.length || 0,
          totalAmount: `$${parseFloat(sale.totalAmount || 0).toFixed(2)}`,
          paymentMethod: sale.paymentMethod || "-",
          status: sale.status || "-",
          createdAt: sale.createdAt,
          date: sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "-",
        }));

        data = filterByDate(data, "createdAt");
      } else if (activeTab === "customers") {
        const response = await fetch("/api/customers", { headers });
        if (!response.ok) throw new Error("Failed to fetch customers");
        const result = await response.json();
        const customers = result.customers || result.data || result || [];

        data = customers.map((customer) => ({
          customerCode: customer.customerCode || "-",
          name: customer.name || "-",
          phone: customer.phone || "-",
          email: customer.email || "-",
          status: customer.status || "-",
          createdAt: customer.createdAt,
          date: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-",
        }));

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <PageHeader title="Reports" subtitle="View and export reports" />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting || !can("reports.export")}
            className="theme-btn-danger"
          >
            {exporting ? "Exporting..." : "PDF"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting || !can("reports.export")}
            className="theme-btn-success"
          >
            {exporting ? "Exporting..." : "Excel"}
          </button>
        </div>
      </div>

      {/* Tabs and Content Card */}
      <div className="theme-card">
        {/* Tab Navigation */}
        <div
          className="flex overflow-x-auto border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-4 py-4 text-sm font-medium transition whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? "var(--color-primary)" : "var(--text-secondary)",
                borderBottom: activeTab === tab.id ? "2px solid var(--color-primary)" : "none",
              }}
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
              <h3 className="text-sm font-semibold theme-text-primary">
                Date Range
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium block mb-2 theme-text-primary">
                    From Date
                  </span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="theme-input w-full"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium block mb-2 theme-text-primary">
                    To Date
                  </span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="theme-input w-full"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    onClick={loadReportData}
                    className="theme-btn-primary w-full"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Apply Filter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!hasDateFilter && (
            <p className="text-sm theme-text-secondary">
              This report auto-loads and updates when the tab is switched.
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="theme-panel theme-text-danger p-4 text-sm">
            {error}
          </div>
          )}

          {/* Data Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold theme-text-primary">
              Data ({reportData.length} records)
            </h3>

            {!error && reportData.length === 0 && !loading && (
              <div className="theme-panel p-8 text-center text-sm theme-text-secondary">
                No data available. {hasDateFilter && "Try adjusting the date range."}
              </div>
            )}

            {loading && (
              <div className="theme-panel p-8 text-center text-sm theme-text-secondary">
                Loading data...
              </div>
            )}

            {reportData.length > 0 && !loading && (
              <div className="overflow-x-auto rounded-lg border theme-border">
                <table className="w-full text-sm">
                  <thead className="theme-panel-strong">
                    <tr className="border-b theme-border">
                      {COLUMNS[activeTab].map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left font-semibold theme-text-primary"
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
                        className="border-b theme-border"
                      >
                        {COLUMNS[activeTab].map((col) => {
                          let value = row[col.key];

                          // Format status badges
                          if (col.key === "status") {
                            let badgeStyle = {
                              backgroundColor: "var(--bg-secondary)",
                              color: "var(--text-secondary)",
                            };

                            if (value === "In Stock" || value === "Active") {
                              badgeStyle = {
                                backgroundColor: "var(--color-success-light)",
                                color: "var(--color-success-dark)",
                              };
                            } else if (value === "Low Stock") {
                              badgeStyle = {
                                backgroundColor: "var(--color-warning-light)",
                                color: "var(--color-warning-dark)",
                              };
                            } else if (value === "Out of Stock") {
                              badgeStyle = {
                                backgroundColor: "var(--color-danger-light)",
                                color: "var(--color-danger-dark)",
                              };
                            } else if (value === "Inactive") {
                              badgeStyle = {
                                backgroundColor: "var(--bg-tertiary)",
                                color: "var(--text-secondary)",
                              };
                            }

                            return (
                              <td key={col.key} className="px-4 py-3">
                                <span
                                  className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={badgeStyle}
                                >
                                  {value}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={col.key}
                              className="px-4 py-3"
                              style={{ color: "var(--text-secondary)" }}
                            >
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
            <div
              className="rounded-lg p-4 text-sm"
              style={{
                backgroundColor: "var(--color-warning-light)",
                color: "var(--color-warning-dark)",
              }}
            >
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