function ReportTable({ products = [], loading }) {
  if (loading) {
    return (
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Loading preview...
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        No product preview data available for the selected range.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm" style={{ color: "var(--text-primary)" }}>
          <thead
            style={{
              backgroundColor: "var(--panel-strong-bg)",
              color: "var(--text-primary)",
            }}
          >
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Min Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 10).map((product) => (
              <tr key={product._id} style={{ borderTop: "1px solid var(--border-color)" }}>
                <td className="px-4 py-3">{product.sku}</td>
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.category?.name || "-"}</td>
                <td className="px-4 py-3">{product.supplier?.name || "-"}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">{product.minStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className="p-4 text-xs"
        style={{
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--panel-bg)",
          color: "var(--text-secondary)",
        }}
      >
        Showing up to 10 products from the selected report preview.
      </div>
    </div>
  );
}

export default ReportTable;
