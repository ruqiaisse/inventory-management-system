import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import { getUser, logoutUser } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun, LogOut, Menu } from "lucide-react";

function Topbar({ title, onToggleSidebar }) {
  const user = getUser() || {};
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const initials = (user.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Determine role badge colors
  const getRoleBadgeStyle = () => {
    const userRole = (user.role || "staff").toLowerCase();
    
    switch (userRole) {
      case "admin":
        return {
          backgroundColor: "var(--color-danger-light)",
          color: "var(--color-danger-dark)",
        };
      case "manager":
        return {
          backgroundColor: "var(--color-info-light)",
          color: "var(--color-info-dark)",
        };
      case "staff":
      default:
        return {
          backgroundColor: "var(--panel-muted-bg)",
          color: "var(--text-secondary)",
        };
    }
  };

  // Determine avatar colors based on role
  const getAvatarStyle = () => {
    const userRole = (user.role || "staff").toLowerCase();
    
    switch (userRole) {
      case "admin":
        return {
          backgroundColor: "var(--color-danger)",
          color: "white",
        };
      case "manager":
        return {
          backgroundColor: "var(--color-info)",
          color: "white",
        };
      case "staff":
      default:
        return {
          backgroundColor: "var(--text-secondary)",
          color: "white",
        };
    }
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        color: "var(--text-primary)",
      }}
    >
      {/* Left Section - Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 lg:hidden"
          style={{
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {title}
            </h1>
            <Breadcrumb />
          </div>
        </div>
      </div>

      {/* Right Section - Theme Toggle, Welcome, Role, Avatar, Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all duration-300 hover:opacity-80"
          style={{
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
          aria-label="Toggle dark mode"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </button>

        {/* Divider */}
        <div
          className="h-8 w-px transition-colors duration-300"
          style={{ backgroundColor: "var(--border-color)" }}
        ></div>

        {/* User Info Section */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Welcome, {user.name || "Admin"}
          </p>
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300"
            style={getRoleBadgeStyle()}
          >
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Staff"}
          </span>
        </div>

        {/* Avatar */}
        <div
          title={user.name || "Admin"}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors duration-300"
          style={getAvatarStyle()}
        >
          {initials}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 sm:px-4 font-medium transition-all duration-300 hover:opacity-90"
          style={{
            backgroundColor: "var(--color-danger)",
            color: "white",
            border: "1px solid var(--color-danger)",
          }}
          title="Log out of your account"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;