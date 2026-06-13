/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { getErrorMessage } from "../utils/api_helper";

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
          buttonText="Add Supplier"
          onButtonClick={handleAdd}
        />

        {/* LOADING */}
        {loading && (
          <p className="mt-6">Loading suppliers...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className="mt-6 text-red-500">{error}</p>
        )}

        {/* EMPTY STATE */}
        {!loading && suppliers.length === 0 && (
          <div className="mt-10 text-center">
            <p className="mb-4 text-gray-500">
              No suppliers found
            </p>

            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Supplier
            </button>
          </div>
        )}

        {/* TABLE */}
       {!loading && suppliers.length > 0 && (
  <div className="mt-6 overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
    <table className="w-full">
      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
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
          <tr
            key={supplier._id}
            className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <td className="p-3">{index + 1}</td>

            <td className="p-3 font-medium">
              {supplier.name}
            </td>

            <td className="p-3 text-slate-600 dark:text-slate-300">
              {supplier.email}
            </td>

            <td className="p-3 text-slate-600 dark:text-slate-300">
              {supplier.phone}
            </td>

            <td className="p-3 text-slate-600 dark:text-slate-300">
              {supplier.address}
            </td>

            <td className="p-3">
              {supplier.isActive ? (
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  Inactive
                </span>
              )}
            </td>

            <td className="p-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleEdit(supplier)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(supplier._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
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
          title={
            selectedSupplier ? "Edit Supplier" : "Add Supplier"
          }
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Supplier name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Address"
                rows="3"
              />
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {selectedSupplier ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>

         {/* TOAST */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
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
