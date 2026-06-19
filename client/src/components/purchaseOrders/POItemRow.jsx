function POItemRow({
  item,
  index,
  products,
  onChange,
  onRemove,
  readOnly = false,
}) {
  const rowTotal = (item.quantity || 0) * (item.unitPrice || 0);

  const handleProductChange = (productId) => {
    const selectedProduct = products.find((p) => p._id === productId);
    onChange(index, "product", productId);
    if (selectedProduct) {
      onChange(index, "unitPrice", selectedProduct.price);
    }
  };

  return (
    <div className="flex gap-3 items-end bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
      {/* Product Dropdown */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Product
        </label>
        <select
          value={item.product || ""}
          onChange={(e) => handleProductChange(e.target.value)}
          disabled={readOnly}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} (SKU: {product.sku})
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="w-24">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Qty
        </label>
        <input
          type="number"
          min="1"
          value={item.quantity || 0}
          onChange={(e) => onChange(index, "quantity", parseInt(e.target.value) || 0)}
          disabled={readOnly}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Unit Price */}
      <div className="w-32">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Unit Price
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice || 0}
          onChange={(e) => onChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
          disabled={readOnly}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Row Total */}
      <div className="w-32">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Total
        </label>
        <div className="px-3 py-2 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-900 dark:text-slate-100">
          ${rowTotal.toFixed(2)}
        </div>
      </div>

      {/* Remove Button */}
      {!readOnly && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded text-sm font-medium transition"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export default POItemRow;
