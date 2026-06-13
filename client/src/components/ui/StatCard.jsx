// StatCard does not require default React import

function StatCard({ title, value, color = "#2563eb", trend }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{title}</div>
      <h2 className="text-3xl font-bold" style={{ color }}>
        {value}
      </h2>
      {trend && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{trend}</p>}
      <span className="block mt-4 h-1 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

export default StatCard;
