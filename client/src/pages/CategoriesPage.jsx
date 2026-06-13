/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";

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
    setSelectedCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setIsModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (category) => {
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
          buttonText="Add Category"
          onButtonClick={handleAdd}
        />

        {/* LOADING */}
        {loading && (
          <p className="mt-6">Loading categories...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className="mt-6 text-red-500">{error}</p>
        )}

        {/* EMPTY STATE */}
        {!loading && categories.length === 0 && (
          <div className="mt-10 text-center">
            <p className="mb-4 text-gray-500">
              No categories found
            </p>

            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Category
            </button>
          </div>
        )}

        {/* TABLE */}
       <div className="mt-6 overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
  <table className="w-full">
    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
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
        <tr
          key={category._id}
          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"
        >
          <td className="p-3">{index + 1}</td>

          <td className="p-3 font-medium">
            {category.name}
          </td>

          <td className="p-3 text-slate-600 dark:text-slate-300">
            {category.description}
          </td>

          <td className="p-3">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                category.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </td>

          <td className="p-3 text-slate-600 dark:text-slate-300">
            {new Date(category.createdAt).toLocaleDateString()}
          </td>

          <td className="p-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleEdit(category)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDelete(category._id)}
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
        {/* MODAL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            selectedCategory
              ? "Edit Category"
              : "Add Category"
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block mb-1">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {selectedCategory
                ? "Update Category"
                : "Create Category"}
            </button>
          </form>
        </Modal>

        {/* TOAST */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;