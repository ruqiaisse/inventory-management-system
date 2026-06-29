import { Trash2 } from "lucide-react";

function SaleItemRow({ item, products, onUpdate, onRemove, index }) {
  const selectedProduct = products.find((p) => p._id === item.productId);

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p._id === productId);

    if (product) {
      onUpdate(index, {
        ...item,
        productId: product._id,
        productName: product.name,
        price: product.price,
        stock: product.stock,
        subtotal: (product.price * item.quantity).toFixed(2),
      });
    }
  };

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || 0;
    const price = item.price || 0;
    const subtotal = (quantity * price).toFixed(2);

    onUpdate(index, {
      ...item,
      quantity,
      subtotal,
    });
  };

  const maxStock = selectedProduct?.stock ?? item.stock ?? 0;
  const isOutOfStock = (maxStock || 0) <= 0;
  const isOverStock = (item.quantity || 0) > maxStock && maxStock > 0;
  const stockMessage = isOutOfStock
    ? "Out of stock"
    : isOverStock
    ? `Only ${maxStock} available`
    : null;

  return (
    <div
      className="grid grid-cols-12 gap-3 p-3 rounded-lg border"
      style={{
        borderColor: isOutOfStock || isOverStock ? "var(--danger-border)" : "var(--border-color)",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Product Dropdown */}
      <div className="col-span-4">
        <select
          value={item.productId}
          onChange={handleProductChange}
          className="w-full px-2 py-2 text-sm border rounded focus:outline-none"
          style={{
            borderColor: isOutOfStock || isOverStock ? "var(--danger-border)" : "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} (Stock: {product.stock})
            </option>
          ))}
        </select>
        {stockMessage && (
          <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
            {stockMessage}
          </p>
        )}
      </div>

      {/* Quantity Input */}
      <div className="col-span-2">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-full px-2 py-2 text-sm text-center border rounded focus:outline-none"
          style={{
            borderColor: isOutOfStock || isOverStock ? "var(--danger-border)" : "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          disabled={!item.productId}
        />
      </div>

      {/* Price */}
      <div className="col-span-2 text-center">
        <div
          className="px-2 py-2 text-sm rounded"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
        >
          {selectedProduct ? selectedProduct.price.toFixed(2) : "0.00"}
        </div>
      </div>

      {/* Subtotal */}
      <div className="col-span-2 text-center">
        <div
          className="px-2 py-2 text-sm font-semibold rounded"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
        >
          {item.subtotal ? parseFloat(item.subtotal).toFixed(2) : "0.00"}
        </div>
      </div>

      {/* Remove Button */}
      <div className="col-span-2 flex justify-center items-center">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 rounded transition-all theme-btn-danger"
          title="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default SaleItemRow;
