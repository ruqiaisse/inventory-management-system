import { Navigate } from "react-router-dom";
import { usePermissionContext } from "../context/PermissionContext";

function PermissionRoute({ permission, children }) {
  const { permissions, loading } = usePermissionContext();

  if (loading) {
    return null;
  }

  if (!permissions[permission]) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PermissionRoute;
