import { useState, useEffect } from "react";
import { X } from "lucide-react";

function CustomerForm({ selectedCustomer, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData({
        name: selectedCustomer.name || "",
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || "",
        status: selectedCustomer.status || "active",
        notes: selectedCustomer.notes || "",
      });
    }
  }, [selectedCustomer]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Full Name <span style={{ color: "var(--danger-text)" }}>*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
          }`}
          style={{
            borderColor: errors.name ? "var(--danger-border)" : "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          placeholder="Enter customer name"
          disabled={isSubmitting}
        />
        {errors.name && <p style={{ color: "var(--danger-text)" }} className="text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Phone Number <span style={{ color: "var(--danger-text)" }}>*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
          }`}
          style={{
            borderColor: errors.phone ? "var(--danger-border)" : "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          placeholder="Enter phone number"
          disabled={isSubmitting}
        />
        {errors.phone && <p style={{ color: "var(--danger-text)" }} className="text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          placeholder="Enter email address"
          disabled={isSubmitting}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          placeholder="Enter address"
          rows="3"
          disabled={isSubmitting}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Status <span style={{ color: "var(--danger-text)" }}>*</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.status ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
          }`}
          style={{
            borderColor: errors.status ? "var(--danger-border)" : "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          disabled={isSubmitting}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && <p style={{ color: "var(--danger-text)" }} className="text-sm mt-1">{errors.status}</p>}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
          placeholder="Enter notes"
          rows="3"
          disabled={isSubmitting}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 theme-btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : selectedCustomer ? "Update Customer" : "Save Customer"}
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

export default CustomerForm;
