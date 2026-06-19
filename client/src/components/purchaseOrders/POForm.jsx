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
      setFormData({
        supplier: selectedPO.supplier?._id || "",
        items: selectedPO.items || [{ product: "", quantity: 1, unitPrice: 0 }],
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Supplier Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Supplier *
        </label>
        <select
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          required
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Items *
          </label>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <POItemRow
              key={index}
              item={item}
              index={index}
              products={products}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
              readOnly={false}
            />
          ))}
        </div>

        {/* Scan Button */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition"
        >
          📱 Scan Product
        </button>
      </div>

      {/* Grand Total */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Grand Total:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Enter any special instructions or notes..."
          rows="3"
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm">
          {success}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
        >
          {loading ? "Saving..." : selectedPO ? "Update PO" : "Save as Draft"}
        </button>
      </div>

      {/* Scanner */}
      {showScanner && (
        <BarcodeScanner
          mode="barcode"
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          visible={Boolean(error)}
          onClose={() => setError("")}
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          visible={Boolean(success)}
          onClose={() => setSuccess("")}
        />
      )}
    </form>
  );
}

export default POForm;
