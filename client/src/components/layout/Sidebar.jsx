import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getUser } from "../../services/authService";
import { getCompanyName } from "../../utils/settings_helper";
import usePermission from "../../hooks/usePermission";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "🏠" },
  { label: "Products", path: "/products", icon: "📦" },
  { label: "Categories", path: "/categories", icon: "📁" },
  { label: "Suppliers", path: "/suppliers", icon: "🚚" },
  { label: "Reports", path: "/reports", icon: "📊" },
  { label: "Activity Log", path: "/activity", icon: "🕐" },
];

const adminItems = [
  { label: "Users", path: "/users", icon: "👥", permission: "users.view" },
  { label: "Settings", path: "/settings", icon: "⚙️", permission: "settings.view" },
  { label: "Permissions", path: "/permissions", icon: "🛡️", permission: "users.update" },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [brandName, setBrandName] = useState(getCompanyName());
  const user = getUser();
  const { can } = usePermission();

  useEffect(() => {
    const onResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) setCollapsed(true);
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

  const visibleItems = navItems;
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
    <aside
      className={`flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 transition-all duration-200 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        {!collapsed && <div className="text-lg font-semibold text-sky-600">{brandName || "InvenPro"}</div>}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-md px-2 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="mt-2 space-y-1 px-1">
        {visibleItems.map((item) => {
          const key = item.path.replace("/", "").split("/")[0];
          const badge = counts[key] || 0;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-r-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600 dark:bg-slate-800 dark:text-sky-400 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                } ${collapsed ? "justify-center" : "justify-start"}`
              }
            >
              <span className="w-6 text-center">{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
        {visibleAdminItems.length > 0 && (
          <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
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
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-r-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-sky-50 text-sky-600 border-l-4 border-sky-600 dark:bg-slate-800 dark:text-sky-400 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                } ${collapsed ? "justify-center" : "justify-start"}`
              }
            >
              <span className="w-6 text-center">{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
