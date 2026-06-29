

function StatCard({ title, value, color = "var(--color-primary)", trend, icon: Icon, badge }) {
  return (
    <div
      className="rounded-lg border shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
              {title}
            </div>
            <div className="text-2xl font-bold" style={{ color }}>
              {value}
            </div>
          </div>
          {Icon && (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0 ml-3"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color,
              }}
            >
              <Icon size={24} />
            </div>
          )}
        </div>

        {trend && (
          <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
            {trend}
          </p>
        )}

        {badge && (
          <div className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: color, color: "white" }}>
            {badge}
          </div>
        )}

        <div className="mt-4 h-1 rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

export default StatCard;
