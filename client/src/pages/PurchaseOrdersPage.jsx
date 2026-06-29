import { useEffect, useState } from "react";
import { Plus, Eye, FileText, Edit2, Trash2 } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import POStatusBadge from "../components/purchaseOrders/POStatusBadge";
import POForm from "../components/purchaseOrders/POForm";
import PODetailModal from "../components/purchaseOrders/PODetailModal";
import usePermission from "../hooks/usePermission";
import { getUser } from "../services/authService";

import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  submitPO,
  approvePO,
  receivePO,
  cancelPO,
  deletePurchaseOrder,
  uploadPOFile,
  downloadPOPDF,
} from "../services/purchaseOrderService";

import {
  getProducts,
} from "../services/productService";

import {
  getSuppliers,
} from "../services/supplierService";

const TABS = [
  { id: "all", label: "All", status: null },
  { id: "draft", label: "Draft", status: "draft" },
  { id: "submitted", label: "Submitted", status: "submitted" },
  { id: "approved", label: "Approved", status: "approved" },
  { id: "received", label: "Received", status: "received" },
];

function PurchaseOrdersPage() {
  const { can } = usePermission();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPO, setSelectedPO] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const currentTab = TABS.find((t) => t.id === activeTab);
      const status = currentTab?.status;

      const [posData, productsData, suppliersData] = await Promise.all([
        getPurchaseOrders(status),
        getProducts({}),
        getSuppliers(),
      ]);

      setOrders(posData);
      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (err) {
      console.error("Error loading data:", err);
      showToast(err.response?.data?.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreate = () => {
    setSelectedPO(null);
    setShowForm(true);
  };

  const handleEdit = (po) => {
    setSelectedPO(po);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedPO) {
        await updatePurchaseOrder(selectedPO._id, formData);
        showToast("PO updated successfully");
      } else {
        await createPurchaseOrder(formData);
        showToast("PO created successfully");
      }
      setShowForm(false);
      setSelectedPO(null);
      loadData();
    } catch (err) {
      console.error("Error saving PO:", err);
      showToast(err.response?.data?.message || "Failed to save PO", "error");
    }
  };

  const handleDetailAction = async (action, data = null) => {
    try {
      if (action === "submit") {
        await submitPO(selectedPO._id);
        showToast("PO submitted successfully");
      } else if (action === "approve") {
        await approvePO(selectedPO._id);
        showToast("PO approved successfully");
      } else if (action === "receive") {
        await receivePO(selectedPO._id);
        showToast("PO received and stock updated");
      } else if (action === "cancel") {
        await cancelPO(selectedPO._id);
        showToast("PO cancelled");
      } else if (action === "upload") {
        await uploadPOFile(selectedPO._id, data);
        const updated = await getPurchaseOrderById(selectedPO._id);
        setSelectedPO(updated);
      } else if (action === "export") {
        await downloadPOPDF(selectedPO._id, selectedPO.poNumber);
        showToast("PDF downloaded");
      } else if (action === "edit") {
        setShowDetail(false);
        handleEdit(selectedPO);
      }

      if (action !== "upload" && action !== "export" && action !== "edit") {
        setShowDetail(false);
        loadData();
      }
    } catch (err) {
      console.error("Error performing action:", err);
      showToast(err.response?.data?.message || "Action failed", "error");
    }
  };

  const handleOpenDetail = async (po) => {
    try {
      const fullPO = await getPurchaseOrderById(po._id);
      setSelectedPO(fullPO);
      setShowDetail(true);
    } catch (err) {
      console.error("Error fetching PO details:", err);
      showToast("Failed to load PO details", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PO?")) return;

    try {
      await deletePurchaseOrder(id);
      showToast("PO deleted successfully");
      loadData();
    } catch (err) {
      console.error("Error deleting PO:", err);
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  // Filter tabs for staff (only approved and received)
  const user = getUser() || {};
  const visibleTabs = user.role === "staff"
    ? TABS.filter((t) => ["approved", "received"].includes(t.id))
    : TABS;

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <PageHeader
          title="Purchase Orders"
          action={
            can("purchase-orders.create") && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center justify-center rounded-md theme-btn-primary"
                title="Create Purchase Order"
              >
                <Plus size={16} className="mr-2" />
                Create PO
              </button>
            )
          }
        />

        {/* Tabs */}
        <div className="mt-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex gap-2 overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 text-sm font-medium whitespace-nowrap transition"
                style={
                  activeTab === tab.id
                    ? { borderBottom: "2px solid var(--color-primary)", color: "var(--color-primary)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 text-center theme-text-secondary">
            <p>Loading purchase orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="mt-10 text-center">
            <p className="mb-4 theme-text-secondary">No purchase orders found</p>
            {can("purchase-orders.create") && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center justify-center rounded-md theme-btn-primary"
                title="Create first purchase order"
              >
                <Plus size={16} className="mr-2" />
                Create First PO
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && orders.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg shadow theme-card">
            <table className="theme-table text-sm">
              <thead className="theme-table-header">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">PO Number</th>
                  <th className="px-4 py-3 text-left font-semibold">Supplier</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Created By</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((po) => (
                  <tr key={po._id} className="theme-table-row">
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: "var(--color-primary)" }}>
                      <button onClick={() => handleOpenDetail(po)} className="hover:underline" style={{ color: "inherit" }}>
                        {po.poNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 theme-text-secondary">{po.supplier?.name || "N/A"}</td>
                    <td className="px-4 py-3 theme-text-secondary">{po.items?.length || 0} items</td>
                    <td className="px-4 py-3 font-semibold theme-text-primary">
                      ${po.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3">
                      <POStatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3 theme-text-secondary">{po.createdBy?.name || "Unknown"}</td>
                    <td className="px-4 py-3 theme-text-secondary">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenDetail(po)}
                        className="theme-icon-btn theme-icon-btn-primary"
                        style={{ width: "2.5rem", height: "2.5rem" }}
                        title="View PO details"
                      >
                        <Eye size={16} />
                      </button>
                      {can("purchase-orders.export") && (
                        <button
                          onClick={() => downloadPOPDF(po._id, po.poNumber)}
                          className="theme-icon-btn theme-btn-danger"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                          title="Export PO as PDF"
                        >
                          <FileText size={16} />
                        </button>
                      )}
                      {can("purchase-orders.update") && po.status === "draft" && (
                        <button
                          onClick={() => handleEdit(po)}
                          className="theme-icon-btn theme-btn-secondary"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                          title="Edit PO"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {can("purchase-orders.delete") && po.status === "draft" && (
                        <button
                          onClick={() => handleDelete(po._id)}
                          className="theme-icon-btn theme-btn-danger"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                          title="Delete PO"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal - Scrollable */}
        <Modal
          isOpen={showForm}
          title={selectedPO ? "Edit Purchase Order" : "Create Purchase Order"}
          onClose={() => {
            setShowForm(false);
            setSelectedPO(null);
          }}
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <POForm
              selectedPO={selectedPO}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowForm(false);
                setSelectedPO(null);
              }}
              products={products}
              suppliers={suppliers}
            />
          </div>
        </Modal>

        {/* Detail Modal */}
        <PODetailModal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedPO(null);
          }}
          po={selectedPO}
          onAction={handleDetailAction}
        />

        {/* Toast */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onClose={() => setToast({ visible: false, message: "", type: "success" })}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default PurchaseOrdersPage;