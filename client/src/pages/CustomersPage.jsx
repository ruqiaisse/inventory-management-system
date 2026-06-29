/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import CustomerForm from "../components/customers/CustomerForm";
import CustomerDetailModal from "../components/customers/CustomerDetailModal";
import CustomerStatusBadge from "../components/customers/CustomerStatusBadge";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";

import { getUser } from "../services/authService";
import usePermission from "../hooks/usePermission";
import { apiClient } from "../utils/api_helper";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Role permissions modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [role, setRole] = useState("admin");
  const [rolePerms, setRolePerms] = useState({});
  const [roleLoading, setRoleLoading] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const user = getUser();
  const { can } = usePermission();

  const filterTimeoutRef = useRef(null);

  // LOAD DATA - only on component mount
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCustomers({});
      setCustomers(data.customers || []);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load customers";
      setError(errorMsg);
      console.error("Error loading customers:", err);
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
        status: statusFilter || undefined,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key]
      );

      const data = await getCustomers(filters);
      setCustomers(data.customers || []);
      setError("");
    } catch (err) {
      const errorMsg = "Failed to apply filters";
      console.error(errorMsg, err);
      showToast(errorMsg, "error");
    }
  }, [search, statusFilter]);

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
  }, [search, statusFilter, applyFilters]);

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

  // OPEN ADD MODAL
  const handleAdd = () => {
    if (!can("customers.create")) return;
    setSelectedCustomer(null);
    setIsFormModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (customer) => {
    if (!can("customers.update")) return;
    setSelectedCustomer(customer);
    setIsFormModalOpen(true);
  };

  // VIEW CUSTOMER DETAILS
  const handleView = async (customerId) => {
    try {
      const customer = await getCustomerById(customerId);
      setSelectedCustomer(customer);
      setIsDetailModalOpen(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load customer";
      showToast(errorMsg, "error");
    }
  };

  // ROLE PERMISSIONS HELPERS
  const permissionActions = [
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.delete",
  ];

  const fetchRolePermissions = async (selectedRole) => {
    try {
      setRoleLoading(true);
      const res = await apiClient.get(`/permissions/role/${selectedRole}`);
      const perms = {};
      (res.data || []).forEach((p) => {
        perms[p.action] = !!p.allowed;
      });
      setRolePerms(perms);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load role permissions", "error");
    } finally {
      setRoleLoading(false);
    }
  };

  // Fetch role perms when modal opens or role changes
  useEffect(() => {
    if (isRoleModalOpen) {
      fetchRolePermissions(role);
    }
  }, [isRoleModalOpen, role]);

  const toggleRolePerm = (action) => {
    setRolePerms((prev) => ({ ...prev, [action]: !prev[action] }));
  };

  const saveRolePermissions = async () => {
    try {
      const updates = permissionActions.map((action) => ({ action, allowed: !!rolePerms[action] }));
      await apiClient.put(`/permissions/role/${role}`, updates);
      showToast("Permissions updated successfully", "success");
      setIsRoleModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update permissions", "error");
    }
  };

  // DELETE CUSTOMER
  const handleDelete = async () => {
    if (!can("customers.delete")) return;

    setIsDeleting(true);
    try {
      await deleteCustomer(selectedCustomer._id);
      setCustomers((prev) =>
        prev.filter((c) => c._id !== selectedCustomer._id)
      );
      showToast("Customer deleted successfully");
      setIsDetailModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete customer";
      showToast(errorMsg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // FORM SUBMISSION
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer._id, formData);
        setCustomers((prev) =>
          prev.map((c) =>
            c._id === selectedCustomer._id ? { ...c, ...formData } : c
          )
        );
        showToast("Customer updated successfully");
      } else {
        const newCustomer = await createCustomer(formData);
        setCustomers((prev) => [newCustomer.customer, ...prev]);
        showToast("Customer created successfully");
      }
      setIsFormModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Operation failed";
      showToast(errorMsg, "error");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Customers">
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
              Loading customers...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Customers">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Customers"
          description="Manage your customers and track their purchase history"
          action={
            can("customers.create") && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 theme-btn-primary"
              >
                <Plus size={20} />
                Add Customer
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or phone..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

        {/* Customers Table */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          {customers.length === 0 ? (
            <div className="p-8 text-center">
              <p style={{ color: "var(--text-secondary)" }}>
                No customers found. Start by adding a new customer.
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
                      Code
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Name
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Phone
                    </th>
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Email
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
                      Created
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
                  {customers.map((customer) => (
                    <tr
                      key={customer._id}
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "var(--border-color)",
                      }}
                      className="hover:opacity-75 transition-opacity"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold" style={{ color: "var(--color-primary)" }}>{customer.customerCode}</span>
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-primary)" }}>
                        {customer.name}
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-primary)" }}>
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>
                        {customer.email || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <CustomerStatusBadge status={customer.status} />
                      </td>
                      <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(customer._id)}
                            className="p-2 theme-icon-btn theme-icon-btn-primary"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          {can("customers.update") && (
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-2 theme-icon-btn theme-icon-btn-secondary"
                              title="Edit"
                            >
                              <Edit2 size={16} />
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
            setSelectedCustomer(null);
          }}
          title={selectedCustomer ? "Edit Customer" : "Add New Customer"}
          size="md"
        >
          <CustomerForm
            selectedCustomer={selectedCustomer}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setIsFormModalOpen(false);
              setSelectedCustomer(null);
            }}
          />
        </Modal>

        {/* Detail Modal */}
        <CustomerDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          onEdit={() => {
            setIsDetailModalOpen(false);
            setIsFormModalOpen(true);
          }}
          onDelete={handleDelete}
          isDeleting={isDeleting}
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

export default CustomersPage;
