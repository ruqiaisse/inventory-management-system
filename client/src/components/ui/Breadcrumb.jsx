// Breadcrumb uses JSX but does not need the default React import under the new JSX transform
import { Link, useLocation } from "react-router-dom";

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <div className="text-xs text-slate-500 dark:text-slate-400">
      <Link to="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-100">
        Home
      </Link>
      {parts.map((p, idx) => {
        const path = "/" + parts.slice(0, idx + 1).join("/");
        const label = p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <span key={path} className="inline-flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">/</span>
            <Link to={path} className="hover:text-slate-700 dark:hover:text-slate-100">
              {label}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumb;
