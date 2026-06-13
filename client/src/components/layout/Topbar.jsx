import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import { getUser, logoutUser } from "../../services/authService";

const roleStyles = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  staff: "bg-slate-100 text-slate-700",
};

function Topbar({ title }) {
  const user = getUser() || {};
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const initials = (user.name || "Admin").split(" ").map((n) => n[0]).slice(0, 2).join("");

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDark((current) => !current)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {dark ? "☾" : "☼"}
        </button>

        <div className="text-right">
          <p className="text-sm text-slate-700 dark:text-slate-300">Welcome, {user.name || "Admin"}</p>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleStyles[user.role] || roleStyles.staff}`}>
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Staff"}
          </span>
        </div>

        <div
          title={user.name || "Admin"}
          className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-semibold"
        >
          {initials}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;

