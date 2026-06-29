import { useState, useEffect } from "react";
import { apiClient, getToken } from "../utils/api_helper";
import Toast from "../components/ui/Toast";

const PermissionsPage = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [currentMode, setCurrentMode] = useState("role"); // "role" or "user"
  const [rolePermissions, setRolePermissions] = useState([]);
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const roles = ["admin", "manager", "staff"];

  // Grouped permission structure
  const permissionGroups = [
    {
      group: "Products",
      actions: ["products.view", "products.create", "products.update", "products.delete", "products.export"],
    },
    {
      group: "Categories",
      actions: ["categories.view", "categories.create", "categories.update", "categories.delete"],
    },
    {
      group: "Suppliers",
      actions: ["suppliers.view", "suppliers.create", "suppliers.update", "suppliers.delete"],
    },
    {
      group: "Customers",
      actions: ["customers.view", "customers.create", "customers.update", "customers.delete"],
    },
    {
      group: "Sales",
      actions: ["sales.view", "sales.create", "sales.cancel"],
    },
    {
      group: "Stock",
      actions: ["stock.view", "stock.add", "stock.deduct"],
    },
    {
      group: "Users",
      actions: ["users.view", "users.create", "users.update", "users.delete"],
    },
    {
      group: "Reports",
      actions: ["reports.view", "reports.export"],
    },
    {
      group: "Settings",
      actions: ["settings.view", "settings.update"],
    },
    {
      group: "Activity",
      actions: ["activity.view", "activity.clear"],
    },
  ];

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Fetch role permissions
  const fetchRolePermissions = async (role) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/permissions/role/${role}`);
      setRolePermissions(res.data);
    } catch (err) {
      showToast("Failed to load role permissions", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      setUserList(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      showToast("Failed to load users", "error");
      console.error(err);
    }
  };

  // Fetch user permissions
  const fetchUserPermissions = async (userId) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/permissions/user/${userId}`);
      setUserPermissions(res.data);
    } catch (err) {
      console.error(err);
      setUserPermissions([]); // No overrides yet
    } finally {
      setLoading(false);
    }
  };

  // Load role permissions when tab changes
  useEffect(() => {
    if (currentMode === "role") {
      fetchRolePermissions(activeTab);
    }
  }, [activeTab, currentMode]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Update role permission
  const toggleRolePermission = async (action, currentValue) => {
    try {
      const token = getToken();
      const newValue = !currentValue;

      await apiClient.put(`/permissions/role/${activeTab}`, [{ action, allowed: newValue }]);

      showToast("Permission updated");
      fetchRolePermissions(activeTab);
    } catch (err) {
      showToast("Failed to update permission", "error");
      console.error(err);
    }
  };

  // Update user permission
  const toggleUserPermission = async (action, currentValue) => {
    if (!selectedUser) {
      showToast("Please select a user", "error");
      return;
    }

    try {
      const token = getToken();
      const newValue = currentValue === undefined ? true : !currentValue;

      await apiClient.put(`/permissions/user/${selectedUser._id}`, [{ action, allowed: newValue }]);

      showToast("User permission updated");
      fetchUserPermissions(selectedUser._id);
    } catch (err) {
      showToast("Failed to update user permission", "error");
      console.error(err);
    }
  };

  // Get permission value for role
  const getRolePermissionValue = (action) => {
    const perm = rolePermissions.find((p) => p.action === action);
    return perm ? perm.allowed : false;
  };

  // Get permission details for user
  const getUserPermissionDetails = (action) => {
    if (!selectedUser) return { roleDefault: false, override: undefined };

    // Get role default
    const rolePerms = rolePermissions.find((p) => p.action === action);
    const roleDefault = rolePerms ? rolePerms.allowed : false;

    // Get user override
    const userOverride = userPermissions.find((p) => p.action === action);

    return {
      roleDefault,
      override: userOverride?.allowed,
    };
  };

  if (currentMode === "role") {
    return (
      <div
        className="min-h-screen p-8 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1
                className="text-3xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Permissions Management
              </h1>
              <p
                className="max-w-2xl"
                style={{ color: "var(--text-secondary)" }}
              >
                Configure role-based access rights for your inventory system with clear controls and fast updates.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                className="rounded-2xl p-4 shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p
                  className="text-sm uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Selected Role
                </p>
                <p
                  className="mt-2 text-xl font-semibold capitalize"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activeTab}
                </p>
              </div>
              <div
                className="rounded-2xl p-4 shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p
                  className="text-sm uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Permission Groups
                </p>
                <p
                  className="mt-2 text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {permissionGroups.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentMode("role")}
              className="rounded-full px-5 py-2 text-sm font-semibold transition"
              style={{
                backgroundColor:
                  currentMode === "role" ? "var(--color-primary)" : "var(--bg-tertiary)",
                color:
                  currentMode === "role" ? "white" : "var(--text-primary)",
              }}
            >
              Role Permissions
            </button>
            <button
              onClick={() => setCurrentMode("user")}
              className="rounded-full px-5 py-2 text-sm font-semibold transition"
              style={{
                backgroundColor:
                  currentMode === "user" ? "var(--color-primary)" : "var(--bg-tertiary)",
                color:
                  currentMode === "user" ? "white" : "var(--text-primary)",
              }}
            >
              User Overrides
            </button>
          </div>

          <div className="mb-6 inline-flex overflow-hidden rounded-full" style={{ border: "1px solid var(--border-color)" }}>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className="px-4 py-2 text-sm font-semibold transition"
                style={{
                  backgroundColor:
                    activeTab === role ? "var(--color-primary)" : "transparent",
                  color:
                    activeTab === role ? "white" : "var(--text-primary)",
                  borderRight:
                    role !== roles[roles.length - 1]
                      ? "1px solid var(--border-color)"
                      : "none",
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {loading ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              Loading permissions...
            </div>
          ) : (
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div
                  key={group.group}
                  className="overflow-hidden rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    className="flex items-center justify-between gap-4 border-b px-6 py-4"
                    style={{ borderColor: "var(--border-color)", backgroundColor: "var(--panel-bg)" }}
                  >
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {group.group}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {group.actions.length} actions
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y text-sm" style={{ borderColor: "var(--border-color)" }}>
                      <thead style={{ backgroundColor: "var(--panel-strong-bg)" }}>
                        <tr>
                          <th
                            className="px-6 py-3 text-left font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Action
                          </th>
                          <th
                            className="px-6 py-3 text-center font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Allowed
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ borderColor: "var(--border-color)" }}>
                        {group.actions.map((action) => (
                          <tr
                            key={action}
                            className="transition"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            <td
                              className="px-6 py-4"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {action}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() =>
                                  toggleRolePermission(
                                    action,
                                    getRolePermissionValue(action)
                                  )
                                }
                                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
                                style={{
                                  backgroundColor: getRolePermissionValue(action)
                                    ? "var(--color-success-light)"
                                    : "var(--color-danger-light)",
                                  color: getRolePermissionValue(action)
                                    ? "var(--color-success-dark)"
                                    : "var(--color-danger-dark)",
                                }}
                              >
                                {getRolePermissionValue(action)
                                  ? "✓ Enabled"
                                  : "✗ Disabled"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={closeToast}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1
              className="text-3xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Permissions Management
            </h1>
            <p
              className="max-w-2xl"
              style={{ color: "var(--text-secondary)" }}
            >
              Review and override individual user permissions with clarity and confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              <p
                className="text-sm uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                Selected User
              </p>
              <p
                className="mt-2 text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {selectedUser ? selectedUser.name : "No user selected"}
              </p>
            </div>
            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              <p
                className="text-sm uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                Current Mode
              </p>
              <p
                className="mt-2 text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                User Overrides
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentMode("role")}
            className="rounded-full px-5 py-2 text-sm font-semibold transition"
            style={{
              backgroundColor:
                currentMode === "role" ? "var(--color-primary)" : "var(--bg-tertiary)",
              color:
                currentMode === "role" ? "white" : "var(--text-primary)",
            }}
          >
            Role Permissions
          </button>
          <button
            onClick={() => setCurrentMode("user")}
            className="rounded-full px-5 py-2 text-sm font-semibold transition"
            style={{
              backgroundColor:
                currentMode === "user" ? "var(--color-primary)" : "var(--bg-tertiary)",
              color:
                currentMode === "user" ? "white" : "var(--text-primary)",
            }}
          >
            User Overrides
          </button>
        </div>

        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Select User
          </label>
          <select
            value={(selectedUser?._id || selectedUser?.id) || ""}
            onChange={(e) => {
              const user = userList.find((u) => (u._id || u.id) === e.target.value);
              if (user) {
                setSelectedUser(user);
                fetchUserPermissions(user._id || user.id);
              }
            }}
            className="w-full rounded-lg px-4 py-3 text-sm font-medium outline-none transition"
            style={{
              backgroundColor: "var(--input-bg)",
              border: "1px solid var(--input-border)",
              color: "var(--input-text)",
            }}
          >
            <option value="">Choose a user...</option>
            {userList.map((user) => {
              const userKey = user._id || user.id;
              return (
                <option key={userKey} value={userKey}>
                  {user.name} ({user.role}) - {user.email}
                </option>
              );
            })}
          </select>
        </div>

        {selectedUser ? (
          loading ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px dashed var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              Loading permissions...
            </div>
          ) : (
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div
                  key={group.group}
                  className="overflow-hidden rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    className="flex items-center justify-between gap-4 border-b px-6 py-4"
                    style={{ borderColor: "var(--border-color)", backgroundColor: "var(--panel-bg)" }}
                  >
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {group.group}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Override permissions for this area
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-sm"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {group.actions.length} actions
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y text-sm" style={{ borderColor: "var(--border-color)" }}>
                      <thead style={{ backgroundColor: "var(--panel-strong-bg)" }}>
                        <tr>
                          <th
                            className="px-6 py-3 text-left font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Action
                          </th>
                          <th
                            className="px-6 py-3 text-center font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Role Default
                          </th>
                          <th
                            className="px-6 py-3 text-center font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            User Override
                          </th>
                          <th
                            className="px-6 py-3 text-center font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Effective
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ borderColor: "var(--border-color)" }}>
                        {group.actions.map((action) => {
                          const details = getUserPermissionDetails(action);
                          const effective =
                            details.override !== undefined
                              ? details.override
                              : details.roleDefault;
                          return (
                            <tr
                              key={action}
                              className="transition"
                              style={{
                                backgroundColor: "var(--card-bg)",
                                borderColor: "var(--border-color)",
                              }}
                            >
                              <td
                                className="px-6 py-4"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {action}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className="inline-flex rounded-full px-3 py-1 text-sm font-semibold"
                                  style={{
                                    backgroundColor: details.roleDefault
                                      ? "var(--color-success-light)"
                                      : "var(--color-danger-light)",
                                    color: details.roleDefault
                                      ? "var(--color-success-dark)"
                                      : "var(--color-danger-dark)",
                                  }}
                                >
                                  {details.roleDefault ? "✓ Yes" : "✗ No"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() =>
                                    toggleUserPermission(action, details.override)
                                  }
                                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
                                  style={{
                                    backgroundColor:
                                      details.override === undefined
                                        ? "var(--bg-tertiary)"
                                        : details.override
                                        ? "var(--color-info-light)"
                                        : "var(--color-danger-light)",
                                    color:
                                      details.override === undefined
                                        ? "var(--text-primary)"
                                        : details.override
                                        ? "var(--color-info-dark)"
                                        : "var(--color-danger-dark)",
                                  }}
                                >
                                  {details.override === undefined
                                    ? "—"
                                    : details.override
                                    ? "✓"
                                    : "✗"}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className="inline-flex rounded-full px-3 py-1 text-sm font-semibold"
                                  style={{
                                    backgroundColor: effective
                                      ? "var(--color-success-light)"
                                      : "var(--color-danger-light)",
                                    color: effective
                                      ? "var(--color-success-dark)"
                                      : "var(--color-danger-dark)",
                                  }}
                                >
                                  {effective ? "✓ Yes" : "✗ No"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px dashed var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            Select a user to view and manage their permissions.
          </div>
        )}
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={closeToast}
      />
    </div>
  );
};

export default PermissionsPage;