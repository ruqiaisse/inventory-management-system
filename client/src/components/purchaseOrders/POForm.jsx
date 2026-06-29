import { useState, useEffect } from "react";
import POItemRow from "./POItemRow";
import BarcodeScanner from "../ui/BarcodeScanner";
import Toast from "../ui/Toast";
import { findProductByBarcode } from "../../services/productService";

function POForm({ selectedPO, onSubmit, onClose, products, suppliers }) {
  const [formData, setFormData] = useState({
    supplier: "",
    items: [{ product: "", quantity: 1, unitPrice: 0 }],
    notes: "",
  });
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (selectedPO) {
      const normalizedItems = selectedPO.items.map((item) => ({
        ...item,
        product: typeof item.product === "object" ? item.product._id : item.product,
      }));

      setFormData({
        supplier: selectedPO.supplier?._id || "",
        items: normalizedItems.length > 0 ? normalizedItems : [{ product: "", quantity: 1, unitPrice: 0 }],
        notes: selectedPO.notes || "",
      });
    }
  }, [selectedPO]);

  const calculateGrandTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: "", quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleScan = async (code) => {
    if (!code) {
      setShowScanner(false);
      return;
    }

    try {
      const result = await findProductByBarcode(code);
      if (result.found) {
        const product = result.product;
        const newItem = {
          product: product._id,
          quantity: 1,
          unitPrice: product.price,
        };
        setFormData({
          ...formData,
          items: [...formData.items, newItem],
        });
        setSuccess(`Product added: ${product.name}`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Product not found");
        setTimeout(() => setError(""), 3000);
      }
      setShowScanner(false);
    } catch (err) {
      console.error("Error finding product:", err);
      setError("Failed to scan product");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.supplier) {
      setError("Supplier is required");
      return;
    }

    if (formData.items.length === 0) {
      setError("At least one item is required");
      return;
    }

    if (formData.items.some((item) => !item.product || item.quantity <= 0)) {
      setError("All items must have a product and valid quantity");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save PO");
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = calculateGrandTotal();

  const labelStyle = {
    color: "var(--text-secondary)",
  };

  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--input-text)",
  };

  const buttonPrimaryStyle = {
    backgroundColor: "var(--button-primary-bg)",
    color: "var(--button-primary-text)",
  };

  const buttonSecondaryStyle = {
    backgroundColor: "var(--button-secondary-bg)",
    color: "var(--button-secondary-text)",
    border: "1px solid var(--border-color)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>
          Supplier *
        </label>
        <select
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg focus:outline-none theme-input"
          style={inputStyle}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium" style={labelStyle}>
            Items *
          </label>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1 rounded text-sm font-medium transition"
            style={buttonPrimaryStyle}
          >
            + Add Item
          </button>
        </div>

        <div
          className="grid grid-cols-12 gap-3 mb-2 px-3 py-2 font-semibold text-sm rounded-t-lg"
          style={{
            backgroundColor: "var(--panel-bg)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="col-span-5">Product</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-center">Unit Price</div>
          <div className="col-span-2 text-center">Total</div>
          <div className="col-span-1"></div>
        </div>

        <div
          className="space-y-2 p-3 rounded-b-lg"
          style={{ backgroundColor: "var(--panel-muted-bg)", border: "1px solid var(--border-color)" }}
        >
          {formData.items.map((item, index) => (
            <POItemRow
              key={index}
              item={item}
              index={index}
              products={products}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
              readOnly={false}
              showLabels={false}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition"
          style={buttonPrimaryStyle}
        >
          📱 Scan Product
        </button>
      </div>

      <div
        className="p-4 rounded-lg border-2"
        style={{
          backgroundColor: "var(--panel-bg)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      >
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Grand Total:
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Enter any special instructions or notes..."
          rows="3"
          className="w-full px-4 py-2 rounded-lg focus:outline-none theme-input"
          style={inputStyle}
        />
      </div>

      {error && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-danger-light)",
            border: "1px solid var(--color-danger)",
            color: "var(--color-danger-dark)",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-success-light)",
            border: "1px solid var(--color-success)",
            color: "var(--color-success-dark)",
          }}
        >
          {success}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-medium transition"
          style={buttonSecondaryStyle}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg font-medium transition"
          style={buttonPrimaryStyle}
        >
          {loading ? "Saving..." : selectedPO ? "Update PO" : "Save as Draft"}
        </button>
      </div>

      {showScanner && (
        <BarcodeScanner mode="barcode" onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {error && (
        <Toast message={error} type="error" visible={Boolean(error)} onClose={() => setError("")} />
      )}
      {success && (
        <Toast message={success} type="success" visible={Boolean(success)} onClose={() => setSuccess("")} />
      )}
    </form>
  );
}

export default POForm;
