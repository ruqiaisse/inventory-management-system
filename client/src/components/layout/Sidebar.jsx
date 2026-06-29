import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getUser } from "../../services/authService";
import { getCompanyName } from "../../utils/settings_helper";
import usePermission from "../../hooks/usePermission";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "🏠" },
  { label: "Products", path: "/products", icon: "📦", permission: "products.view" },
  { label: "Categories", path: "/categories", icon: "📁", permission: "categories.view" },
  { label: "Suppliers", path: "/suppliers", icon: "🚚", permission: "suppliers.view" },
  { label: "Purchase Orders", path: "/purchase-orders", icon: "📋", permission: "purchase-orders.view" },
  { label: "Customers", path: "/customers", icon: "👤", permission: "customers.view" },
  { label: "Sales", path: "/sales", icon: "💰", permission: "sales.view" },
  { label: "Reports", path: "/reports", icon: "📊", permission: "reports.view" },
  { label: "Activity Log", path: "/activity", icon: "🕐", permission: "activity.view" },
];

const adminItems = [
  { label: "Users", path: "/users", icon: "👥", permission: "users.view" },
  { label: "Settings", path: "/settings", icon: "⚙️", permission: "settings.view" },
  { label: "Permissions", path: "/permissions", icon: "🛡️", permission: "users.update" },
];

function Sidebar({ isMobileOpen = false, onMobileClose = () => {}, isCollapsed = false, onToggle = () => {} }) {
  const [brandName, setBrandName] = useState(getCompanyName());
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const user = getUser();
  const { can } = usePermission();

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onCompanyNameUpdated = (event) => {
      setBrandName(event?.detail || getCompanyName());
    };

    window.addEventListener("companyNameUpdated", onCompanyNameUpdated);
    return () => window.removeEventListener("companyNameUpdated", onCompanyNameUpdated);
  }, []);

  const visibleItems = navItems.filter((item) => !item.permission || can(item.permission));
  const visibleAdminItems = adminItems.filter((item) =>
    item.path === "/permissions" ? user?.role === "admin" : can(item.permission)
  );

  const counts = {
    products: 14,
    categories: 6,
    suppliers: 3,
    activity: 9,
    users: 4,
  };

  return (
    <>
      {isMobile && isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-200 lg:static lg:translate-x-0 ${isMobile ? (isMobileOpen ? "translate-x-0" : "-translate-x-full") : isCollapsed ? "w-20" : "w-56"} ${isMobile ? "w-72 max-w-[85vw]" : "h-full"}`}
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--sidebar-bg)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            borderColor: "var(--border-color)",
          }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-lg">📦</span>
              <div className="truncate text-sm font-semibold" style={{ color: "var(--sidebar-active)" }}>
                {brandName || "InvenPro"}
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex w-full justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-lg">📦</span>
            </div>
          )}
          <button
            type="button"
            onClick={isMobile ? onMobileClose : onToggle}
            className="rounded-md px-2 py-2 text-sm transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
            aria-label="Toggle sidebar"
          >
            {isMobile ? <X size={16} /> : isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="mt-2 space-y-1 px-1 flex-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const key = item.path.replace("/", "").split("/")[0];
          const badge = counts[key] || 0;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const baseClasses = "flex items-center gap-3 rounded-r-lg px-3 py-3 text-sm transition-colors font-medium";
                const activeClasses = isActive
                  ? "border-l-4 font-semibold"
                  : "hover:opacity-80";
                return `${baseClasses} ${activeClasses} ${isCollapsed ? "justify-center" : "justify-start"}`;
              }}
              style={({ isActive }) => ({
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                color: isActive ? "var(--sidebar-active)" : "var(--sidebar-text)",
                borderLeftColor: isActive ? "var(--sidebar-active)" : "transparent",
              })}
            >
              <span className="w-6 text-center">{item.icon}</span>
              {!isCollapsed && <span className="flex-1">{item.label}</span>}
              {!isCollapsed && badge > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--color-danger)",
                    color: "white",
                  }}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
        {visibleAdminItems.length > 0 && (
          <div
            className="mt-4 border-t pt-3 text-xs uppercase tracking-widest font-semibold"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            Admin
          </div>
        )}
        {visibleAdminItems.map((item) => {
          const key = item.path.replace("/", "").split("/")[0];
          const badge = counts[key] || 0;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const baseClasses = "flex items-center gap-3 rounded-r-lg px-3 py-3 text-sm transition-colors font-medium";
                const activeClasses = isActive
                  ? "border-l-4 font-semibold"
                  : "hover:opacity-80";
                return `${baseClasses} ${activeClasses} ${isCollapsed ? "justify-center" : "justify-start"}`;
              }}
              style={({ isActive }) => ({
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                color: isActive ? "var(--sidebar-active)" : "var(--sidebar-text)",
                borderLeftColor: isActive ? "var(--sidebar-active)" : "transparent",
              })}
            >
              <span className="w-6 text-center">{item.icon}</span>
              {!isCollapsed && <span className="flex-1">{item.label}</span>}
              {!isCollapsed && badge > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--color-danger)",
                    color: "white",
                  }}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
