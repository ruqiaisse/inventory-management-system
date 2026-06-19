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
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
        Stock by Category
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="category" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="value"
              fill="#0284c7"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StockByCategoryChart;