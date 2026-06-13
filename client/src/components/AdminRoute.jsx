import { Navigate } from "react-router-dom";
import { getUser } from "../services/authService";

function AdminRoute({ children }) {
  const user = getUser();

  if (!user?.role || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
