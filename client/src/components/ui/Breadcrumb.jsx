// Breadcrumb uses JSX but does not need the default React import under the new JSX transform
import { Link, useLocation } from "react-router-dom";

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
      <Link to="/" style={{ color: "var(--text-secondary)" }} className="hover:opacity-80">
        Home
      </Link>
      {parts.map((p, idx) => {
        const path = "/" + parts.slice(0, idx + 1).join("/");
        const label = p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <span key={path} className="inline-flex items-center gap-1">
            <span style={{ color: "var(--text-tertiary)" }}>/</span>
            <Link to={path} style={{ color: "var(--text-secondary)" }} className="hover:opacity-80">
              {label}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumb;
