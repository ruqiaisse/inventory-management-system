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
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Stock Value Trend
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last 7 days of stock value
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Value",
              ]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StockValueTrendChart;