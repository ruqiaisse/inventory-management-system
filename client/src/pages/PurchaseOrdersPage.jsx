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
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Create Purchase Order"
              >
                <Plus size={16} className="mr-2" />
                Create PO
              </button>
            )
          }
        />

        {/* Tabs */}
        <div className="mt-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-2 overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 text-center text-slate-500">
            <p>Loading purchase orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="mt-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No purchase orders found
            </p>
            {can("purchase-orders.create") && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
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
          <div className="mt-6 overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    PO Number
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((po) => (
                  <tr
                    key={po._id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => handleOpenDetail(po)}
                        className="hover:underline"
                      >
                        {po.poNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {po.supplier?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {po.items?.length || 0} items
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      ${po.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3">
                      <POStatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {po.createdBy?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleOpenDetail(po)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                        title="View PO details"
                      >
                        <Eye size={16} />
                      </button>
                      {can("purchase-orders.export") && (
                        <button
                          onClick={() => downloadPOPDF(po._id, po.poNumber)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-rose-500 text-white hover:bg-rose-600 transition"
                          title="Export PO as PDF"
                        >
                          <FileText size={16} />
                        </button>
                      )}
                      {can("purchase-orders.update") && po.status === "draft" && (
                        <button
                          onClick={() => handleEdit(po)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-500 text-white hover:bg-slate-600 transition"
                          title="Edit PO"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {can("purchase-orders.delete") && po.status === "draft" && (
                        <button
                          onClick={() => handleDelete(po._id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 transition"
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

        {/* Form Modal */}
        <Modal
          isOpen={showForm}
          title={selectedPO ? "Edit Purchase Order" : "Create Purchase Order"}
          onClose={() => {
            setShowForm(false);
            setSelectedPO(null);
          }}
        >
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
