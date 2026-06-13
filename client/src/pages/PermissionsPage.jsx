import { useState, useEffect } from "react";
import { apiClient } from "../utils/api_helper";
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
      setUserList(res.data.users || []);
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Permissions Management
              </h1>
              <p className="text-gray-600">
                Manage role-based and user-specific permissions
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setCurrentMode("role")}
                className={`px-4 py-2 rounded font-medium transition ${
                  currentMode === "role"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Role Permissions
              </button>
              <button
                onClick={() => setCurrentMode("user")}
                className={`px-4 py-2 rounded font-medium transition ${
                  currentMode === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                User Overrides
              </button>
            </div>

            {/* Role Tabs */}
            <div className="mb-6 flex gap-2 border-b">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`px-6 py-3 font-medium transition capitalize ${
                    activeTab === role
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Permissions Table */}
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading permissions...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {permissionGroups.map((group) => (
                  <div key={group.group} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-6 py-4 border-b">
                      <h3 className="font-bold text-gray-900">{group.group}</h3>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                            Action
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                            Allowed
                          </th>u
                        </tr>
                      </thead>
                      <tbody>
                        {group.actions.map((action) => (
                          <tr key={action} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
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
                                className={`px-4 py-2 rounded font-medium transition ${
                                  getRolePermissionValue(action)
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                {getRolePermissionValue(action) ? "✓ ON" : "✗ OFF"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Permissions Management
            </h1>
            <p className="text-gray-600">
              Manage role-based and user-specific permissions
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setCurrentMode("role")}
              className={`px-4 py-2 rounded font-medium transition ${
                currentMode === "role"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Role Permissions
            </button>
            <button
              onClick={() => setCurrentMode("user")}
              className={`px-4 py-2 rounded font-medium transition ${
                currentMode === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              User Overrides
            </button>
          </div>

          {/* User Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              value={selectedUser?._id || ""}
              onChange={(e) => {
                const user = userList.find((u) => u._id === e.target.value);
                if (user) {
                  setSelectedUser(user);
                  fetchUserPermissions(user._id);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a user...</option>
              {userList.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role}) - {user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Permissions Table */}
          {selectedUser ? (
            loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading permissions...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {permissionGroups.map((group) => (
                  <div key={group.group} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-6 py-4 border-b">
                      <h3 className="font-bold text-gray-900">{group.group}</h3>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                            Action
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                            Role Default
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                            User Override
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                            Effective
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.actions.map((action) => {
                          const details = getUserPermissionDetails(action);
                          const effective = details.override !== undefined 
                            ? details.override 
                            : details.roleDefault;

                          return (
                            <tr key={action} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {action}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    details.roleDefault
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {details.roleDefault ? "✓ Yes" : "✗ No"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() =>
                                    toggleUserPermission(action, details.override)
                                  }
                                  className={`px-4 py-2 rounded font-medium transition ${
                                    details.override === undefined
                                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      : details.override
                                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                      : "bg-red-100 text-red-700 hover:bg-red-200"
                                  }`}
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
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    effective
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
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
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-600">
                Select a user to view and manage their permissions
              </div>
            </div>
          )}
        </div>
        <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={closeToast} />
      </div>
  );
};

export default PermissionsPage;
