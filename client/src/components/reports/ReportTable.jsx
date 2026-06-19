function ReportTable({ products = [], loading }) {
  if (loading) {
    return <div className="text-sm text-slate-500">Loading preview...</div>;
  }

  if (!products.length) {
    return <div className="text-sm text-slate-500">No product preview data available for the selected range.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
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
              <tr key={product._id} className="border-t border-slate-200 dark:border-slate-700">
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
      <div className="border-t border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
        Showing up to 10 products from the selected report preview.
      </div>
    </div>
  );
}

export default ReportTable;
