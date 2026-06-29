import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
} from "recharts"; 

function ProductStatusChart({ data = [] }) { 
  // Get colors from CSS variables
  const getChartColors = () => {
    const root = document.documentElement;
    return [
      getComputedStyle(root).getPropertyValue('--status-in-stock').trim() || "#22c55e",
      getComputedStyle(root).getPropertyValue('--status-low-stock').trim() || "#f59e0b",
      getComputedStyle(root).getPropertyValue('--status-out-stock').trim() || "#ef4444",
    ];
  };

  const COLORS = getChartColors();

  // Format data for display
  const chartData = data.length > 0 ? data : [
    { status: "In Stock", count: 0 },
    { status: "Low Stock", count: 0 },
    { status: "Out of Stock", count: 0 },
  ];

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
  const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
  const cardBg = getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim();
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

  return ( 
    <div
      className="rounded-xl p-6 transition-colors duration-300"
      style={{
        backgroundColor: `var(--card-bg)`,
        border: `1px solid var(--border-color)`,
        boxShadow: `var(--card-shadow)`,
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: `var(--text-primary)` }}>
            Product Status
          </h2>
          <p className="text-sm" style={{ color: `var(--text-secondary)` }}>
            Overview of inventory status
          </p>
        </div>
        <div
          className="rounded-lg px-4 py-2"
          style={{
            backgroundColor: `var(--bg-tertiary)`,
            color: `var(--text-secondary)`,
          }}
        >
          <p className="text-sm font-medium">
            Total: <span className="font-semibold" style={{ color: `var(--text-primary)` }}>{total}</span>
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ width: "100%", height: "300px", minHeight: "300px", minWidth: 0, marginBottom: "1.5rem" }}>
        {total > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                outerRadius={80}
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
                  backgroundColor: `var(--card-bg)`,
                  border: `1px solid var(--border-color)`,
                  borderRadius: "8px",
                  padding: "10px",
                  color: `var(--text-primary)`,
                }}
                labelStyle={{ color: `var(--text-secondary)` }}
                formatter={(value) => [`${value} products`, "Count"]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "15px" }}
                formatter={(value) => (
                  <span style={{ color: `var(--text-secondary)`, fontSize: "0.875rem" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p style={{ color: `var(--text-secondary)`, marginBottom: "0.5rem" }}>
                📊 No data available
              </p>
              <p className="text-sm" style={{ color: `var(--text-secondary)` }}>
                Add products to see status breakdown
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-3 border-t pt-6" style={{ borderColor: `var(--border-color)` }}>
          {chartData.map((item, index) => {
            const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
            const statusLabels = ["In Stock", "Low Stock", "Out of Stock"];
            
            return (
              <div
                key={index}
                className="text-center p-3 rounded-lg"
                style={{ backgroundColor: `var(--bg-secondary)` }}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <p className="text-sm font-medium" style={{ color: `var(--text-primary)` }}>
                  {item.count}
                </p>
                <p className="text-xs mt-1" style={{ color: `var(--text-secondary)` }}>
                  {statusLabels[index]}
                </p>
                <p className="text-xs font-semibold mt-1" style={{ color: `var(--text-secondary)` }}>
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