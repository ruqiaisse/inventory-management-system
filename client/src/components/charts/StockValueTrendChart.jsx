import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function StockValueTrendChart({ data = [] }) {
  // Get colors from CSS variables
  const getLineColor = () => {
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue('--chart-line-color').trim() || "#2563eb";
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
          Stock Value Trend
        </h2>

        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          Last 7 days of stock value
        </p>
      </div>

      <div style={{ width: "100%", height: "300px", minHeight: "300px", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3"
              stroke={borderColor}
              opacity={0.5}
            />

            <XAxis 
              dataKey="date"
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
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Value",
              ]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={getLineColor()}
              strokeWidth={2}
              dot={{ fill: getLineColor(), r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StockValueTrendChart;