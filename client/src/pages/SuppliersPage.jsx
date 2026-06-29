/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { getErrorMessage } from "../utils/api_helper";
import usePermission from "../hooks/usePermission";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const { can } = usePermission();

  // LOAD SUPPLIERS
  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const data = await getSuppliers();

      setSuppliers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // TOAST HELPER
  const showToast = (message, type = "success") => {
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
  };

  // OPEN ADD MODAL
  const handleAdd = () => {
    if (!can("suppliers.create")) return;

    setSelectedSupplier(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setIsModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (supplier) => {
    if (!can("suppliers.update")) return;

    setSelectedSupplier(supplier);

    setFormData({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

    setIsModalOpen(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");

    if (!confirmDelete) return;

    try {
      await deleteSupplier(id);

      fetchSuppliers();

      showToast("Supplier deleted");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  // FORM CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier._id, formData);

        showToast("Supplier updated successfully");
      } else {
        await createSupplier(formData);

        showToast("Supplier created successfully");
      }

      setIsModalOpen(false);

      fetchSuppliers();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader
          title="Suppliers"
          action={
            can("suppliers.create") ? (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center rounded-lg theme-btn-primary text-sm px-4 py-2"
                title="Add Supplier"
              >
                <Plus size={16} className="mr-2" />
                Add
              </button>
            ) : null
          }
        />

        {/* LOADING */}
        {loading && (
          <p className="mt-6 theme-text-secondary">Loading suppliers...</p>
        )}

        {/* ERROR */}
        {error && (
          <p
            className="mt-6"
            style={{ color: "var(--color-danger)" }}
          >
            {error}
          </p>
        )}

        {/* EMPTY STATE */}
        {!loading && suppliers.length === 0 && (
          <div className="mt-10 text-center">
            <p className="mb-4 theme-text-secondary">No suppliers found</p>

            {can("suppliers.create") && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center justify-center rounded-lg theme-btn-primary"
                title="Add Supplier"
              >
                <Plus size={16} className="mr-2" />
                Add Supplier
              </button>
            )}
          </div>
        )}

        {/* TABLE */}
        {!loading && suppliers.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg shadow theme-card">
            <table className="theme-table w-full">
              <thead className="theme-table-header">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={supplier._id} className="theme-table-row">
                    <td className="p-3">{index + 1}</td>

                    <td className="p-3 font-medium theme-text-primary">
                      {supplier.name}
                    </td>

                    <td className="p-3" style={{ color: "var(--text-secondary)" }}>
                      {supplier.email}
                    </td>

                    <td className="p-3" style={{ color: "var(--text-secondary)" }}>
                      {supplier.phone}
                    </td>

                    <td className="p-3" style={{ color: "var(--text-secondary)" }}>
                      {supplier.address}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          supplier.isActive
                            ? "theme-badge-success"
                            : "theme-badge-muted"
                        }`}
                      >
                        {supplier.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3 flex gap-2">
                      {can("suppliers.update") && (
                        <button
                          type="button"
                          onClick={() => handleEdit(supplier)}
                          className="theme-icon-btn theme-btn-primary"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                          title="Edit Supplier"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      {can("suppliers.delete") && (
                        <button
                          type="button"
                          onClick={() => handleDelete(supplier._id)}
                          className="theme-icon-btn theme-btn-danger"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                          title="Delete Supplier"
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

        {/* MODAL */}
        <Modal
          isOpen={isModalOpen}
          title={selectedSupplier ? "Edit Supplier" : "Add Supplier"}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full theme-input"
                placeholder="Supplier name"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full theme-input"
                placeholder="Email address"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full theme-input"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full theme-input"
                placeholder="Address"
                rows="3"
              />
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="theme-btn-secondary"
              >
                Cancel
              </button>

              <button type="submit" className="theme-btn-primary">
                {selectedSupplier ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>

        {/* TOAST */}
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              visible: false,
            }))
          }
        />
      </div>
    </MainLayout>
  );
};

export default SuppliersPage;