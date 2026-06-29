import { Eye, Edit2, Trash2, X } from "lucide-react";
import Modal from "../ui/Modal";
import CustomerStatusBadge from "./CustomerStatusBadge";

function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onEdit,
  onDelete,
  isDeleting,
}) {
  if (!customer) return null;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      onDelete();
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Details" size="md">
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="flex justify-between items-start">
          <div>
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {customer.name}
            </h3>
            <p
              className="text-sm mt-1 font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              {customer.customerCode}
            </p>
          </div>
          <CustomerStatusBadge status={customer.status} />
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Phone */}
          <div
            className="p-3 rounded-lg border"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              PHONE
            </p>
            <p style={{ color: "var(--text-primary)" }}>
              {customer.phone || "N/A"}
            </p>
          </div>

          {/* Email */}
          <div
            className="p-3 rounded-lg border"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              EMAIL
            </p>
            <p style={{ color: "var(--text-primary)" }}>
              {customer.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Address */}
        {customer.address && (
          <div
            className="p-3 rounded-lg border"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              ADDRESS
            </p>
            <p style={{ color: "var(--text-primary)" }}>{customer.address}</p>
          </div>
        )}

        {/* Notes */}
        {customer.notes && (
          <div
            className="p-3 rounded-lg border"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              NOTES
            </p>
            <p style={{ color: "var(--text-primary)" }}>{customer.notes}</p>
          </div>
        )}

        {/* Created Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Created By
            </p>
            <p style={{ color: "var(--text-primary)" }}>
              {customer.createdBy?.name || "N/A"}
            </p>
          </div>
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Created Date
            </p>
            <p style={{ color: "var(--text-primary)" }}>
              {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 theme-btn-primary"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 theme-btn-danger disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 theme-btn-secondary"
          >
            <X size={16} />
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CustomerDetailModal;
