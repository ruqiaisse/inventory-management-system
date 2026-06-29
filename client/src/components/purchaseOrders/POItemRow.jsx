function POItemRow({
  item,
  index,
  products,
  onChange,
  onRemove,
  readOnly = false,
  showLabels = false,
}) {
  const rowTotal = (item.quantity || 0) * (item.unitPrice || 0);

  const getProductName = () => {
    if (!item.product) return "Unknown Product";
    if (typeof item.product === "object" && item.product.name) {
      return item.product.name;
    }
    if (typeof item.product === "string") {
      const foundProduct = products.find((p) => p._id === item.product);
      return foundProduct ? foundProduct.name : "Unknown Product";
    }
    return "Unknown Product";
  };

  const getProductSKU = () => {
    if (!item.product) return "N/A";
    if (typeof item.product === "object" && item.product.sku) {
      return item.product.sku;
    }
    if (typeof item.product === "string") {
      const foundProduct = products.find((p) => p._id === item.product);
      return foundProduct ? foundProduct.sku : "N/A";
    }
    return "N/A";
  };

  const handleProductChange = (productId) => {
    const selectedProduct = products.find((p) => p._id === productId);
    onChange(index, "product", productId);
    if (selectedProduct) {
      onChange(index, "unitPrice", selectedProduct.price);
    }
  };

  const rowStyle = {
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    color: "var(--text-primary)",
  };

  const fieldStyle = {
    backgroundColor: "var(--panel-bg)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
  };

  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--input-text)",
  };

  const labelStyle = {
    color: "var(--text-secondary)",
  };

  if (readOnly) {
    return (
      <div className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg" style={rowStyle}>
        <div className="col-span-5">
          {showLabels && (
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Product
            </label>
          )}
          <div className="px-3 py-2 rounded" style={fieldStyle}>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {getProductName()}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              SKU: {getProductSKU()}
            </p>
          </div>
        </div>

        <div className="col-span-2">
          {showLabels && (
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Qty
            </label>
          )}
          <div className="px-3 py-2 rounded text-center font-semibold" style={fieldStyle}>
            {item.quantity || 0}
          </div>
        </div>

        <div className="col-span-2">
          {showLabels && (
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Unit Price
            </label>
          )}
          <div className="px-3 py-2 rounded text-center font-semibold" style={fieldStyle}>
            ${(item.unitPrice || 0).toFixed(2)}
          </div>
        </div>

        <div className="col-span-2">
          {showLabels && (
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Total
            </label>
          )}
          <div className="px-3 py-2 rounded text-center font-bold" style={fieldStyle}>
            ${rowTotal.toFixed(2)}
          </div>
        </div>

        <div className="col-span-1" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg" style={rowStyle}>
      <div className="col-span-5">
        {showLabels && (
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Product
          </label>
        )}
        <select
          value={item.product || ""}
          onChange={(e) => handleProductChange(e.target.value)}
          disabled={readOnly}
          className="w-full px-3 py-2 rounded text-sm"
          style={inputStyle}
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} (SKU: {product.sku})
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2">
        {showLabels && (
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Qty
          </label>
        )}
        <input
          type="number"
          min="1"
          value={item.quantity || 0}
          onChange={(e) => onChange(index, "quantity", parseInt(e.target.value) || 0)}
          disabled={readOnly}
          className="w-full px-3 py-2 rounded text-sm"
          style={inputStyle}
        />
      </div>

      <div className="col-span-2">
        {showLabels && (
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Unit Price
          </label>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice || 0}
          onChange={(e) => onChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
          disabled={readOnly}
          className="w-full px-3 py-2 rounded text-sm"
          style={inputStyle}
        />
      </div>

      <div className="col-span-2">
        {showLabels && (
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Total
          </label>
        )}
        <div className="px-3 py-2 rounded text-center font-bold text-sm" style={fieldStyle}>
          ${rowTotal.toFixed(2)}
        </div>
      </div>

      <div className="col-span-1 flex justify-center">
        {!readOnly && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-2 py-2 rounded text-sm font-medium transition"
            style={{
              backgroundColor: "var(--color-danger)",
              color: "var(--text-inverse)",
              border: "1px solid var(--color-danger-dark)",
            }}
            title="Remove item"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default POItemRow;
