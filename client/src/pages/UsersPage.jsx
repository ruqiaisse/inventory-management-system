/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { formatDate } from "../utils/formatDate";
import { getRoleBadge } from "../utils/badgeHelpers";
import { getUsers, updateUser, deleteUser } from "../services/userService";
import { registerUser } from "../services/authService";
import { getUser } from "../services/authService";
import usePermission from "../hooks/usePermission";

function UsersPage() {
  const currentUser = getUser();
  const { can } = usePermission();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    isActive: true,
  });
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };

  const fetchUsers = useCallback(async () => {
    if (!can("users.view")) return;
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [can]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    setFormData({ name: "", email: "", password: "", role: "staff", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "staff",
      isActive: user.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({ name: "", email: "", password: "", role: "staff", isActive: true });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email) {
      showToast("Name and email are required.", "error");
      return;
    }

    if (modalMode === "add" && !formData.password) {
      showToast("Password is required for new users.", "error");
      return;
    }

    try {
      if (modalMode === "add") {
        await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        showToast("User created successfully", "success");
      } else {
        await updateUser(selectedUser._id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });
        showToast("User updated", "success");
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || "Unable to save user.";
      showToast(message, "error");
    }
  };

  const handleDelete = (user) => {
    window.dispatchEvent(
      new CustomEvent("open-confirm", {
        detail: {
          message: `Delete ${user.name}? This cannot be undone.`,
          onConfirm: async () => {
            try {
              await deleteUser(user._id);
              showToast("User deleted", "success");
              fetchUsers();
            } catch (err) {
              showToast(err.response?.data?.message || "Failed to delete user.", "error");
            }
          },
        },
      })
    );
  };

  const renderAvatar = (name, role) => {
    const initials = (name || "").split(" ").filter(Boolean).slice(0, 2).map((item) => item[0]).join("").toUpperCase();
    const bgClass = role === "admin" ? "bg-red-600" : role === "manager" ? "bg-blue-600" : "bg-slate-500";
    return (
      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${bgClass}`}>
        {initials || "US"}
      </div>
    );
  };

  const roleBadge = (role) => {
    const badge = getRoleBadge(role);
    const color = badge.type === "danger" ? "bg-red-100 text-red-700" : badge.type === "info" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700";
    return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{badge.label}</span>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage system users and permissions"
        action={
          can("users.create") ? (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center rounded-md theme-btn-primary"
              title="Add User"
            >
              <Plus size={16} className="mr-2" />
              Add User
            </button>
          ) : null
        }
      />

      {_error && <p className="text-sm theme-text-danger">{_error}</p>}

      {!can("users.view") ? (
        <div className="rounded-3xl theme-card p-6">
          Access denied
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl theme-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b theme-border theme-text-secondary">
                  <th className="py-4 px-3">#</th>
                  <th className="py-4 px-3">Name</th>
                  <th className="py-4 px-3">Email</th>
                  <th className="py-4 px-3">Role</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-3">Joined</th>
                  <th className="py-4 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-10 px-3 text-center theme-text-secondary">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((user, index) => (
                    <tr key={user._id} className="border-b theme-border">
                      <td className="py-4 px-3">{index + 1}</td>
                      <td className="py-4 px-3 flex items-center gap-3">
                        {renderAvatar(user.name, user.role)}
                        <div>
                          <div className="font-semibold theme-text-primary">{user.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-3">{user.email}</td>
                      <td className="py-4 px-3">{roleBadge(user.role)}</td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "theme-badge-success" : "theme-badge-muted"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-3">{formatDate(user.createdAt)}</td>
                      <td className="py-4 px-3 space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="theme-icon-btn theme-icon-btn-secondary"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={currentUser?._id === user._id}
                          onClick={() => handleDelete(user)}
                          className="theme-icon-btn theme-btn-danger disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 px-3 text-center theme-text-secondary">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === "add" ? "Add User" : "Edit User"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ahmed Hassan"
              className="w-full theme-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full theme-input"
            />
          </div>

          {modalMode === "add" && (
            <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full theme-input"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full theme-input"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="isActive" className="text-sm theme-text-primary">
              Active account
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="theme-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="theme-btn-primary"
            >
              {modalMode === "add" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={() => setToast((prev) => ({ ...prev, visible: false }))} />
    </div>
  );
}

export default UsersPage;
