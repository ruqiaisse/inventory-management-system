/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Toast from "../components/ui/Toast";
import Badge from "../components/ui/Badge";
import usePermission from "../hooks/usePermission";

import {
  getActivityLogs,
  clearActivityLogs,
} from "../services/activityService";

import { formatDate } from "../utils/formatDate";

const ActivityPage = () => {
  const { can } = usePermission();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [moduleFilter, setModuleFilter] = useState("");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // LOAD ACTIVITY LOGS
  const fetchLogs = async (module = null) => {
    try {
      setLoading(true);

      const data = await getActivityLogs(module);

      setLogs(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(moduleFilter || null);
  }, [moduleFilter]);

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

  // CLEAR LOGS
  const handleClearLogs = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all activity logs?"
    );

    if (!confirmClear) return;

    try {
      await clearActivityLogs();

      setLogs([]);

      showToast("Activity logs cleared");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Clear failed",
        "error"
      );
    }
  };

  // GET BADGE TYPE FOR MODULE
  const getModuleBadgeType = (module) => {
    const types = {
      products: "info",
      categories: "success",
      suppliers: "warning",
      users: "amber",
      stock: "success",
    };

    return types[module] || "gray";
  };

  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader
          title="Activity Log"
          buttonText={can("activity.clear") ? "Clear All Logs" : undefined}
          onButtonClick={can("activity.clear") ? handleClearLogs : undefined}
        />

        {/* LOADING */}
        {loading && (
          <p className="mt-6">Loading activity logs...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className="mt-6 text-red-500">{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* MODULE FILTER */}
            <div className="mt-6 theme-card p-4">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="theme-input"
              >
                <option value="">All Modules</option>
                <option value="products">Products</option>
                <option value="categories">Categories</option>
                <option value="suppliers">Suppliers</option>
                <option value="users">Users</option>
                <option value="stock">Stock</option>
              </select>
            </div>

            {/* EMPTY STATE */}
            {logs.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-gray-500">
                  No activity logs found
                </p>
              </div>
            )}

            {/* TABLE */}
            {logs.length > 0 && (
              <div className="mt-6 overflow-x-auto theme-card">
                <table className="theme-table">
                  <thead className="theme-table-header">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Action</th>
                      <th className="p-3 text-left">Module</th>
                      <th className="p-3 text-left">Details</th>
                      <th className="p-3 text-left">User</th>
                      <th className="p-3 text-left">Date & Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log._id} className="theme-table-row">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 theme-text-primary">
                          {log.action}
                        </td>
                        <td className="p-3">
                          <Badge
                            type={getModuleBadgeType(log.module)}
                          >
                            {log.module}
                          </Badge>
                        </td>
                        <td className="p-3 theme-text-secondary">
                          {log.details || "-"}
                        </td>
                        <td className="p-3 theme-text-primary">
                          {log.user?.name || "System"}
                        </td>
                        <td className="p-3 theme-text-secondary">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

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

export default ActivityPage;
