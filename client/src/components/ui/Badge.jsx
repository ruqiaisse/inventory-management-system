// Badge is a simple presentational component — no React default import needed

const typeMap = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-sky-100 text-sky-700",
  gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function Badge({ type = "gray", children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${typeMap[type] || typeMap.gray}`}>
      {children}
    </span>
  );
}

export default Badge;
