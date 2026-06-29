import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function StockByCategoryChart({ data = [] }) {
  // Get colors from CSS variables
  const getBarColor = () => {
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue('--chart-bar-color').trim() || "#0284c7";
  };

  const textPrimary = `var(--text-primary)`;
  const textSecondary = `var(--text-secondary)`;
  const borderColor = `var(--border-color)`;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: `var(--card-bg)`,
        border: `1px solid var(--border-color)`,
        boxShadow: `var(--card-shadow)`,
      }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold" style={{ color: textPrimary }}>
          Stock by Category
        </h2>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          Inventory levels by category
        </p>
      </div>

      <div style={{ width: "100%", height: "300px", minHeight: "300px", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3"
              stroke={borderColor}
              opacity={0.5}
            />

            <XAxis 
              dataKey="category"
              stroke={textSecondary}
              style={{ fontSize: "0.875rem" }}
            />

            <YAxis 
              stroke={textSecondary}
              style={{ fontSize: "0.875rem" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: `var(--card-bg)`,
                border: `1px solid var(--border-color)`,
                borderRadius: "8px",
                color: textPrimary,
              }}
              labelStyle={{ color: textSecondary }}
              formatter={(value) => [value, "Stock"]}
            />

            <Bar
              dataKey="value"
              fill={getBarColor()}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StockByCategoryChart;