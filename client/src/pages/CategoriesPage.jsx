/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import usePermission from "../hooks/usePermission";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { getErrorMessage } from "../utils/api_helper";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { can } = usePermission();

  // LOAD CATEGORIES
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const data = await getCategories();

      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    if (!can("categories.create")) return;

    setSelectedCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setIsModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (category) => {
    if (!can("categories.update")) return;

    setSelectedCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setIsModalOpen(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");

    if (!confirmDelete) return;

    try {
      await deleteCategory(id);

      fetchCategories();

      showToast("Category deleted");
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
      if (selectedCategory) {
        await updateCategory(selectedCategory._id, formData);

        showToast("Category updated successfully");
      } else {
        await createCategory(formData);

        showToast("Category created successfully");
      }

      setIsModalOpen(false);

      fetchCategories();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader
          title="Categories"
          action={
            can("categories.create") ? (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center rounded-lg theme-btn-primary text-sm px-4 py-2"
                title="Add Category"
              >
                <Plus size={16} className="mr-2" />
                Add
              </button>
            ) : null
          }
        />

        {/* LOADING */}
        {loading && (
          <p className="mt-6 theme-text-secondary">Loading categories...</p>
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
        {!loading && categories.length === 0 && (
          <div className="mt-10 text-center">
            <p className="mb-4 theme-text-secondary">No categories found</p>

            {can("categories.create") && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center justify-center rounded-lg theme-btn-primary"
                title="Add Category"
              >
                <Plus size={16} className="mr-2" />
                Add Category
              </button>
            )}
          </div>
        )}

        {/* TABLE */}
        {!loading && categories.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg shadow theme-card">
            <table className="theme-table w-full">
              <thead className="theme-table-header">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category, index) => (
                  <tr key={category._id} className="theme-table-row">
                    <td className="p-3">{index + 1}</td>

                    <td className="p-3 font-medium theme-text-primary">
                      {category.name}
                    </td>

                    <td className="p-3 theme-text-secondary">
                      {category.description}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          category.isActive
                            ? "theme-badge-success"
                            : "theme-badge-muted"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3 theme-text-secondary">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 flex flex-wrap gap-2">
                      {can("categories.update") && (
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="theme-icon-btn theme-btn-primary"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                          title="Edit Category"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      {can("categories.delete") && (
                        <button
                          type="button"
                          onClick={() => handleDelete(category._id)}
                          className="theme-icon-btn theme-btn-danger"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                          title="Delete Category"
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
          onClose={() => setIsModalOpen(false)}
          title={selectedCategory ? "Edit Category" : "Add Category"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block mb-2 text-sm font-medium"
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
                placeholder="Category name"
              />
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full theme-input min-h-[120px]"
                placeholder="Category description"
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
                {selectedCategory ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </Modal>

        {/* TOAST */}
        {toast.visible && (
          <Toast message={toast.message} type={toast.type} />
        )}
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;