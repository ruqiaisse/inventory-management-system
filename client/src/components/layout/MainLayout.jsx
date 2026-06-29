import { useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ConfirmModal from "../ui/ConfirmModal";

function MainLayout({ children, title }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen((value) => !value);
    } else {
      setSidebarCollapsed((value) => !value);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Sidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onToggleSidebar={toggleSidebar} />

        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <div key={location.pathname} className="fade-in">
            {children}
          </div>
        </main>
      </div>

      <ConfirmModal />
    </div>
  );
}

export default MainLayout;