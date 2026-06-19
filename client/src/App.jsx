import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import ReportsPage from "./pages/ReportsPage";
import ActivityPage from "./pages/ActivityPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import PermissionsPage from "./pages/PermissionsPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import LoginPage from "./pages/LoginPage";

function App() {
  // Initialize dark mode from localStorage
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout title="Dashboard">
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="products.view">
                <ProductsPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="categories.view">
                <CategoriesPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="suppliers.view">
                <SuppliersPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="purchase-orders.view">
                <PurchaseOrdersPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="reports.view">
                <MainLayout title="Reports">
                  <ReportsPage />
                </MainLayout>
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="activity.view">
                <ActivityPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="users.view">
                <MainLayout title="Users">
                  <UsersPage />
                </MainLayout>
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="settings.view">
                <MainLayout title="Settings">
                  <SettingsPage />
                </MainLayout>
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/permissions"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MainLayout title="Permissions">
                  <PermissionsPage />
                </MainLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

