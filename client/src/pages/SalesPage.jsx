/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Plus, Eye, X } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import SaleForm from "../components/sales/SaleForm";
import InvoiceModal from "../components/sales/InvoiceModal";
import SaleStatusBadge from "../components/sales/SaleStatusBadge";

import {
  getSales,
  getSaleById,
  createSale,
  cancelSale,
} from "../services/saleService";

import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";

import { getUser } from "../services/authService";
import usePermission from "../hooks/usePermission";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Filters & Search
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const user = getUser();
  const { can } = usePermission();

  const filterTimeoutRef = useRef(null);

  // LOAD DATA - only on component mount
  const fetchData = async () => {
    try {
      setLoading(true);

      const [salesData, customersData, productsData] = await Promise.all([
        getSales({}),
        getCustomers({}),
        getProducts({}),
      ]);

      setSales(salesData.sales || []);
      setCustomers(customersData.customers || []);
      setProducts(productsData);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load data";
      setError(errorMsg);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mount only - fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // APPLY FILTERS with debounce
  const applyFilters = useCallback(async () => {
    try {
      const filters = {
        search: search || undefined,
        customerId: customerFilter || undefined,
        paymentMethod: paymentFilter || undefined,
        status: statusFilter || undefined,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key]
      );

      const data = await getSales(filters);
      setSales(data.sales || []);
      setError("");
    } catch (err) {
      const errorMsg = "Failed to apply filters";
      console.error(errorMsg, err);
      showToast(errorMsg, "error");
    }
  }, [search, customerFilter, paymentFilter, statusFilter]);

  // Debounced filter updates
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [search, customerFilter, paymentFilter, statusFilter, applyFilters]);

  // TOAST HELPER
  function showToast(message, type = "success") {
    setToast({
      visible: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 3000);
  }

  // OPEN ADD SALE MODAL
  const handleAddSale = () => {
    if (!can("sales.create")) return;
    setSelectedSale(null);
    setIsFormModalOpen(true);
  };

  // VIEW INVOICE
  const handleViewInvoice = async (saleId) => {
    try {
      const sale = await getSaleById(saleId);
      setSelectedSale(sale);
      setIsInvoiceModalOpen(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load invoice";
      showToast(errorMsg, "error");
    }
  };

  // CANCEL SALE
  const handleCancelSale = async (saleId) => {
    if (!can("sales.update")) return;

    if (!window.confirm("Are you sure you want to cancel this sale?")) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelSale(saleId);
      setSales((prev) =>
        prev.map((s) =>
          s._id === saleId ? { ...s, status: "cancelled" } : s
        )
      );
      showToast("Sale cancelled successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to cancel sale";
      showToast(errorMsg, "error");
    } finally {
      setIsCancelling(false);
    }
  };

  // FORM SUBMISSION
  const handleFormSubmit = async (formData) => {
    try {
      const newSale = await createSale(formData);
      setSales((prev) => [newSale.sale, ...prev]);
      showToast("Sale created successfully!");
      setIsFormModalOpen(false);

      // Show invoice immediately after creation
      setSelectedSale(newSale.sale);
      setIsInvoiceModalOpen(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create sale";
      showToast(errorMsg, "error");
    }
  };

  const handlePrintInvoice = () => {
    if (selectedSale) {
      window.print();
    }
  };

  const handleDownloadInvoice = () => {
    if (!selectedSale) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const lineHeight = 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Invoice", margin, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${selectedSale.invoiceNumber || "-"}`, margin, 32);
    doc.text(`Date: ${new Date(selectedSale.createdAt || Date.now()).toLocaleString()}`, margin, 39);
    doc.text(`Customer: ${selectedSale.customer?.name || "-"}`, margin, 46);
    doc.text(`Payment: ${selectedSale.paymentMethod || "-"}`, margin, 53);

    doc.setLineWidth(0.4);
    doc.line(margin, 60, pageWidth - margin, 60);

    doc.setFont("helvetica", "bold");
    doc.text("Item", margin, 68);
    doc.text("Qty", 110, 68);
    doc.text("Price", 145, 68);
    doc.text("Subtotal", 175, 68);

    doc.setFont("helvetica", "normal");
    let y = 76;
    (selectedSale.items || []).forEach((item) => {
      const name = item.product?.name || item.productName || "Unknown";
      const qty = item.quantity || 0;
      const price = parseFloat(item.price || 0).toFixed(2);
      const subtotal = parseFloat(item.subtotal || 0).toFixed(2);

      const lines = doc.splitTextToSize(name, 80);
      doc.text(lines, margin, y);
      doc.text(String(qty), 110, y);
      doc.text(price, 145, y);
      doc.text(subtotal, 175, y);
      y += Math.max(lines.length * 5, 7);
    });

    doc.setLineWidth(0.4);
    doc.line(margin, y + 4, pageWidth - margin, y + 4);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ${parseFloat(selectedSale.totalAmount || 0).toFixed(2)}`, margin, y + 16);

    doc.save(`${selectedSale.invoiceNumber || "invoice"}.pdf`);
    showToast("Invoice downloaded successfully", "success");
  };

  if (loading) {
    return (
      <MainLayout title="Sales">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div
              className="inline-block w-12 h-12 rounded-full border-4 border-opacity-25 animate-spin"
              style={{
                borderColor: "var(--border-color)",
                borderTopColor: "var(--primary-color)",
              }}
            ></div>
            <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
              Loading sales...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Sales">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Sales"
          description="Manage sales transactions and customer invoices"
          action={
            can("sales.create") && (
              <button
                onClick={handleAddSale}
                className="flex items-center gap-2 theme-btn-primary"
              >
                <Plus size={20} />
                New Sale
              </button>
            )
          }
        />

        {/* Search & Filters */}
        <div
          className="p-4 rounded-lg border space-y-4"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="Search invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Customer
              </label>
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Payment Method
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Money</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-4 rounded-lg border"
            style={{
              borderColor: "var(--danger-border)",
              backgroundColor: "var(--danger-bg)",
              color: "var(--danger-text)",
            }}
          >
            {error}
          </div>
        )}

        {/* Sales Table */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          {sales.length === 0 ? (
            <div className="p-8 text-center">
              <p style={{ color: "var(--text-secondary)" }}>
                No sales found. Start by creating a new sale.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottomWidth: "2px",
                      borderColor: "var(--border-color)",
                      backgroundColor: "var(--bg-tertiary)",
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Invoice
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Customer
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Items
                    </th>
                    <th
                      className="px-6 py-4 text-right font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Total Amount
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Payment Method
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Date
                    </th>
                    <th
                      className="px-6 py-4 text-center font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale._id}
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "var(--border-color)",
                      }}
                      className="hover:opacity-75 transition-opacity"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold" style={{ color: "var(--color-primary)" }}>{sale.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-primary)" }}>
                        {sale.customer?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>
                        {sale.items?.length || 0} item(s)
                      </td>
                      <td className="px-6 py-4 text-right" style={{ color: "var(--text-primary)" }}>
                        <span className="font-semibold">
                          {parseFloat(sale.totalAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>
                        {sale.paymentMethod?.charAt(0).toUpperCase() + sale.paymentMethod?.slice(1)}
                      </td>
                      <td className="px-6 py-4">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewInvoice(sale._id)}
                            className="p-2 theme-icon-btn theme-icon-btn-primary"
                            title="View invoice"
                          >
                            <Eye size={16} />
                          </button>
                          {can("sales.update") && sale.status === "completed" && (
                            <button
                              onClick={() => handleCancelSale(sale._id)}
                              disabled={isCancelling}
                              className="p-2 theme-icon-btn theme-btn-danger"
                              title="Cancel sale"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedSale(null);
          }}
          title="Create New Sale"
          size="lg"
        >
          <SaleForm
            customers={customers}
            products={products}
            selectedSale={selectedSale}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setIsFormModalOpen(false);
              setSelectedSale(null);
            }}
          />
        </Modal>

        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedSale(null);
          }}
          invoice={selectedSale}
          onPrint={handlePrintInvoice}
          onDownload={handleDownloadInvoice}
        />

        {/* Toast */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
        />
      </div>
    </MainLayout>
  );
};

export default SalesPage;
