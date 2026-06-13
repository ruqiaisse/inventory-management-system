import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ConfirmModal from "../ui/ConfirmModal";

function MainLayout({ children, title }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar title={title} />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
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