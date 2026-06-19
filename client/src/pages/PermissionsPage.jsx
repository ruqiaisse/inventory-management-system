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
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950 dark:text-slate-100 mb-2">
                Permissions Management
              </h1>
              <p className="max-w-2xl text-slate-600 dark:text-slate-400">
                Configure role-based access rights for your inventory system with clear controls and fast updates.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Selected Role</p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100 capitalize">{activeTab}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Permission Groups</p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{permissionGroups.length}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentMode("role")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                currentMode === "role"
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Role Permissions
            </button>
            <button
              onClick={() => setCurrentMode("user")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                currentMode === "user"
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              User Overrides
            </button>
          </div>

          <div className="mb-6 inline-flex overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm shadow-slate-900/5 dark:shadow-black/20">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`px-5 py-3 text-sm font-medium transition capitalize ${
                  activeTab === role
                    ? "bg-slate-950 text-white dark:bg-sky-600 dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
              Loading permissions...
            </div>
          ) : (
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.group} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{group.group}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{group.actions.length} actions</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium">Action</th>
                          <th className="px-6 py-3 text-center font-medium">Allowed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {group.actions.map((action) => (
                          <tr key={action} className="bg-white transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                            <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{action}</td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => toggleRolePermission(action, getRolePermissionValue(action))}
                                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                                  getRolePermissionValue(action)
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-800"
                                    : "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900 dark:text-rose-200 dark:hover:bg-rose-800"
                                }`}
                              >
                                {getRolePermissionValue(action) ? "✓ Enabled" : "✗ Disabled"}
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
        <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={closeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-slate-100 mb-2">
              Permissions Management
            </h1>
            <p className="max-w-2xl text-slate-600 dark:text-slate-400">
              Review and override individual user permissions with clarity and confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Selected User</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {selectedUser ? selectedUser.name : "No user selected"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Current Mode</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">User Overrides</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentMode("role")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              currentMode === "role"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Role Permissions
          </button>
          <button
            onClick={() => setCurrentMode("user")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              currentMode === "user"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            User Overrides
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400"
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
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
              Loading permissions...
            </div>
          ) : (
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.group} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{group.group}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Override permissions for this area</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {group.actions.length} actions
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium">Action</th>
                          <th className="px-6 py-3 text-center font-medium">Role Default</th>
                          <th className="px-6 py-3 text-center font-medium">User Override</th>
                          <th className="px-6 py-3 text-center font-medium">Effective</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {group.actions.map((action) => {
                          const details = getUserPermissionDetails(action);
                          const effective = details.override !== undefined ? details.override : details.roleDefault;
                          return (
                            <tr key={action} className="bg-white transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                              <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{action}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${details.roleDefault ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200"}`}>
                                  {details.roleDefault ? "✓ Yes" : "✗ No"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => toggleUserPermission(action, details.override)}
                                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${details.override === undefined ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" : details.override ? "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-200 dark:hover:bg-sky-800" : "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900 dark:text-rose-200 dark:hover:bg-rose-800"}`}>
                                  {details.override === undefined ? "—" : details.override ? "✓" : "✗"}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${effective ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200"}`}>
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
            Select a user to view and manage their permissions.
          </div>
        )}
      </div>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={closeToast} />
    </div>
  );
};

export default PermissionsPage;
