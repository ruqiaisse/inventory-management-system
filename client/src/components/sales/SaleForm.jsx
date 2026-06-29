import { useState } from "react";
import SaleItemRow from "./SaleItemRow";
import BarcodeScanner from "../ui/BarcodeScanner";
import Toast from "../ui/Toast";
import { findProductByBarcode, getProductById } from "../../services/productService";

function SaleForm({ customers, products, selectedSale, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    customerId: "",
    items: [{ productId: "", quantity: 1, price: 0, subtotal: 0 }],
    paymentMethod: "cash",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "success" });

  const calculateGrandTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
  };

  const getStockWarning = (item) => {
    if (!item.productId) return null;

    const product = products.find((p) => p._id === item.productId);
    const availableStock = product?.stock ?? item.stock ?? 0;

    if (availableStock <= 0) {
      return {
        message: `${product?.name || "Selected product"} is out of stock`,
        type: "danger",
      };
    }

    if ((item.quantity || 0) > availableStock) {
      return {
        message: `Only ${availableStock} available for ${product?.name || "selected product"}`,
        type: "warning",
      };
    }

    return null;
  };

  const stockWarnings = formData.items.map(getStockWarning).filter(Boolean);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (formData.items.length === 0) {
      newErrors.items = "At least one product is required";
    }

    const validItems = formData.items.filter((item) => item.productId);
    if (validItems.length === 0) {
      newErrors.items = "At least one product must be selected";
    }

    validItems.forEach((item, index) => {
      if (item.quantity <= 0) {
        newErrors[`quantity_${index}`] = "Quantity must be greater than zero";
      }

      const product = products.find((p) => p._id === item.productId);
      if (product && item.quantity > product.stock) {
        newErrors[`stock_${index}`] = `Insufficient stock for ${product.name}`;
      }
    });

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      customerId: e.target.value,
    }));
    if (errors.customerId) {
      setErrors((prev) => ({ ...prev, customerId: "" }));
    }
  };

  const handlePaymentMethodChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: e.target.value,
    }));
    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: "" }));
    }
  };

  const handleItemUpdate = (index, updatedItem) => {
    const newItems = [...formData.items];
    newItems[index] = updatedItem;
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));

    if (errors[`quantity_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`quantity_${index}`];
      setErrors(newErrors);
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: newItems.length > 0 ? newItems : [{ productId: "", quantity: 1, price: 0, subtotal: 0 }],
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, price: 0, subtotal: 0 }],
    }));
  };

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "success" }), 3000);
  };

  const handleScan = async (code) => {
    if (!code) {
      setShowScanner(false);
      return;
    }

    try {
      const barcodeResult = await findProductByBarcode(code.trim());
      let product = barcodeResult?.found ? barcodeResult.product : null;

      if (!product) {
        try {
          const parsed = JSON.parse(code);
          if (parsed?.id) {
            product = await getProductById(parsed.id);
          }
        } catch {
          // Ignore JSON parse errors and fall back to not found
        }
      }

      if (product) {
        setFormData((prev) => {
          const existingIndex = prev.items.findIndex((item) => item.productId === product._id);

          if (existingIndex >= 0) {
            const currentItem = prev.items[existingIndex];
            const newQuantity = (parseInt(currentItem.quantity, 10) || 0) + 1;
            const updatedItems = [...prev.items];
            updatedItems[existingIndex] = {
              ...currentItem,
              productId: product._id,
              productName: product.name,
              price: product.price,
              stock: product.stock,
              quantity: newQuantity,
              subtotal: (product.price * newQuantity).toFixed(2),
            };
            return { ...prev, items: updatedItems };
          }

          return {
            ...prev,
            items: [
              ...prev.items,
              {
                productId: product._id,
                productName: product.name,
                quantity: 1,
                price: product.price,
                stock: product.stock,
                subtotal: (product.price || 0).toFixed(2),
              },
            ],
          };
        });

        showFeedback(`Product added: ${product.name}`);
      } else {
        showFeedback("Product not found", "error");
      }
    } catch (error) {
      console.error("Failed to scan product", error);
      showFeedback("Failed to scan product", "error");
    } finally {
      setShowScanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const validItems = formData.items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

    setIsSubmitting(true);
    try {
      await onSubmit({
        customerId: formData.customerId,
        items: validItems,
        paymentMethod: formData.paymentMethod,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const grandTotal = calculateGrandTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Customer <span style={{ color: "var(--danger-text)" }}>*</span>
        </label>
        <select
          value={formData.customerId}
          onChange={handleCustomerChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.customerId ? "border-red-500" : ""
          }`}
          style={{
            borderColor: errors.customerId ? "var(--danger-border)" : "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          disabled={isSubmitting}
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name} ({customer.customerCode})
            </option>
          ))}
        </select>
        {errors.customerId && (
          <p style={{ color: "var(--danger-text)" }} className="text-sm mt-1">
            {errors.customerId}
          </p>
        )}
      </div>

      {/* Sale Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Items <span style={{ color: "var(--danger-text)" }}>*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              disabled={isSubmitting}
              className="theme-btn-secondary text-sm"
            >
              Scan QR
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={isSubmitting}
              className="theme-btn-primary text-sm"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-12 gap-3 mb-2 px-3 py-2 font-semibold text-sm rounded-t-lg"
          style={{
            backgroundColor: "var(--panel-bg)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="col-span-4">Product</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Total</div>
          <div className="col-span-2 text-center">Action</div>
        </div>

        {stockWarnings.length > 0 && (
          <div className="mb-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--danger-border)", backgroundColor: "rgba(239, 68, 68, 0.08)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--danger-text)" }}>
              Unavailable items
            </p>
            <ul className="mt-1 space-y-1 text-sm" style={{ color: "var(--danger-text)" }}>
              {stockWarnings.map((warning, index) => (
                <li key={`${warning.message}-${index}`}>• {warning.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div
          className="space-y-2 p-3 rounded-b-lg"
          style={{ backgroundColor: "var(--panel-muted-bg)", border: "1px solid var(--border-color)" }}
        >
          {formData.items.map((item, index) => (
            <SaleItemRow
              key={index}
              index={index}
              item={item}
              products={products}
              onUpdate={handleItemUpdate}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {errors.items && (
          <p style={{ color: "var(--danger-text)" }} className="text-sm mt-2">
            {errors.items}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Payment Method <span style={{ color: "var(--danger-text)" }}>*</span>
        </label>
        <select
          value={formData.paymentMethod}
          onChange={handlePaymentMethodChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.paymentMethod ? "border-red-500" : ""
          }`}
          style={{
            borderColor: errors.paymentMethod ? "var(--danger-border)" : "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          disabled={isSubmitting}
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile">Mobile Money</option>
          <option value="bank">Bank Transfer</option>
        </select>
        {errors.paymentMethod && (
          <p style={{ color: "var(--danger-text)" }} className="text-sm mt-1">
            {errors.paymentMethod}
          </p>
        )}
      </div>

      {/* Grand Total */}
      <div
        className="p-4 rounded-lg border"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-tertiary)",
        }}
      >
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Grand Total:
          </span>
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--primary-color)" }}
          >
            {grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner mode="qr" onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      <Toast
        message={feedback.message}
        type={feedback.type}
        visible={!!feedback.message}
        onClose={() => setFeedback({ message: "", type: "success" })}
      />

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 theme-btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Creating Sale..." : "Create Sale"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 theme-btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default SaleForm;
