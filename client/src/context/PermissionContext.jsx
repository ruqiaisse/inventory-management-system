import { createContext, useContext, useEffect, useState } from "react";
import { apiClient, getToken } from "../utils/api_helper";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchPermissions = async () => {
    const token = getToken();

    if (!token) {
      setPermissions({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get("/permissions/me");
      setPermissions(res.data || {});
    } catch (err) {
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        console.error("Failed to fetch permissions:", err);
      }
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <PermissionContext.Provider value={{ permissions, fetchPermissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => useContext(PermissionContext);