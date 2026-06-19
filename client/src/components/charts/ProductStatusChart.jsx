import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
} from "recharts"; 
 
const COLORS = [ 
  "#22c55e",  // green - in stock
  "#f59e0b",  // amber - low stock
  "#ef4444",  // red - out of stock
]; 

function ProductStatusChart({ data = [] }) { 
  // Format data for display
  const chartData = data.length > 0 ? data : [
    { status: "In Stock", count: 0 },
    { status: "Low Stock", count: 0 },
    { status: "Out of Stock", count: 0 },
  ];

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return ( 
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 p-6 transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Product Status
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of inventory status
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-2 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Total: <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span>
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80 mb-6">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                outerRadius={100}
                label={({ status, count }) => `${status}: ${count}`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value) => [`${value} products`, "Count"]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                📊 No data available
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Add products to see status breakdown
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
            const statusLabels = ["In Stock", "Low Stock", "Out of Stock"];
            
            return (
              <div key={index} className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.count}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {statusLabels[index]}
                </p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {percentage}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  ); 
} 

export default ProductStatusChart;