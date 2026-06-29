import { useState } from "react";
import Modal from "../ui/Modal";
import POStatusBadge from "./POStatusBadge";
import POItemRow from "./POItemRow";
import Toast from "../ui/Toast";
import usePermission from "../../hooks/usePermission";

function PODetailModal({ isOpen, onClose, po, onAction }) {
  const { can } = usePermission();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  if (!po) return null;

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await onAction("upload", file);
      showToast("File uploaded successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleStatusAction = (action) => {
    if (window.confirm(`Are you sure you want to ${action} this PO?`)) {
      onAction(action);
    }
  };

  const canSubmit = po.status === "draft" && can("purchase-orders.submit");
  const canApprove = po.status === "submitted" && can("purchase-orders.approve");
  const canReceive = po.status === "approved" && can("purchase-orders.receive");
  const canCancel = ["draft", "submitted"].includes(po.status) && can("purchase-orders.cancel");
  const canEdit = po.status === "draft" && can("purchase-orders.update");
  const canExport = can("purchase-orders.export");
  const canUpload = can("purchase-orders.upload");

  const sectionStyle = {
    backgroundColor: "var(--panel-bg)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
  };

  const headingStyle = {
    color: "var(--text-primary)",
  };

  const subtitleStyle = {
    color: "var(--text-secondary)",
  };

  const attachmentStyle = {
    backgroundColor: "var(--panel-bg)",
    color: "var(--color-info)",
    border: "1px solid var(--border-color)",
  };

  const buttonPrimaryStyle = {
    backgroundColor: "var(--button-primary-bg)",
    color: "#ffffff",
  };

  const buttonSuccessStyle = {
    backgroundColor: "var(--color-success)",
    color: "#ffffff",
    border: "1px solid var(--color-success-dark)",
  };

  const buttonDangerStyle = {
    backgroundColor: "var(--color-danger)",
    color: "#ffffff",
    border: "1px solid var(--color-danger-dark)",
  };

  const buttonNeutralStyle = {
    backgroundColor: "var(--button-secondary-bg)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
  };

  return (
    <Modal isOpen={isOpen} title="Purchase Order Details" onClose={onClose}>
      <div className="space-y-6">
        <div className="p-4 rounded-lg" style={{
          background: "linear-gradient(90deg, var(--panel-bg) 0%, var(--bg-secondary) 100%)",
          border: "1px solid var(--border-color)",
          color: "var(--text-primary)",
        }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                {po.poNumber}
              </h2>
              <p className="text-sm" style={subtitleStyle}>
                Created: {new Date(po.createdAt).toLocaleDateString()}
              </p>
            </div>
            <POStatusBadge status={po.status} />
          </div>

          {po.createdBy && (
            <p className="text-sm" style={subtitleStyle}>
              Created by: <strong>{po.createdBy.name}</strong>
            </p>
          )}

          {po.approvedBy && po.approvedAt && (
            <p className="text-sm" style={subtitleStyle}>
              Approved by: <strong>{po.approvedBy.name}</strong> on {new Date(po.approvedAt).toLocaleDateString()}
            </p>
          )}

          {po.receivedBy && po.receivedAt && (
            <p className="text-sm" style={subtitleStyle}>
              Received by: <strong>{po.receivedBy.name}</strong> on {new Date(po.receivedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3" style={headingStyle}>
            Supplier Information
          </h3>
          <div className="p-4 rounded-lg space-y-2" style={sectionStyle}>
            <p style={headingStyle}>
              <strong>{po.supplier?.name}</strong>
            </p>
            <p className="text-sm" style={subtitleStyle}>
              Email: {po.supplier?.email || "N/A"}
            </p>
            <p className="text-sm" style={subtitleStyle}>
              Phone: {po.supplier?.phone || "N/A"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3" style={headingStyle}>
            Items ({po.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {po.items?.map((item, index) => (
              <POItemRow
                key={index}
                item={item}
                index={index}
                products={[]}
                onChange={() => {}}
                onRemove={() => {}}
                readOnly={true}
              />
            ))}
          </div>

          <div className="p-4 rounded-lg mt-4" style={sectionStyle}>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold" style={headingStyle}>
                Total:
              </span>
              <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                ${po.totalAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        {po.notes && (
          <div>
            <h3 className="text-lg font-semibold mb-2" style={headingStyle}>
              Notes
            </h3>
            <p className="p-4 rounded-lg" style={{
              ...sectionStyle,
              color: "var(--text-secondary)",
            }}>
              {po.notes}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3" style={headingStyle}>
            Attachments
          </h3>
          <div className="space-y-3">
            {po.attachments && po.attachments.length > 0 ? (
              <div className="space-y-2">
                {po.attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 rounded text-sm truncate"
                    style={attachmentStyle}
                  >
                    📄 {attachment.split("/").pop()}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={subtitleStyle}>
                No files attached
              </p>
            )}

            {canUpload && (
              <div>
                <label className="block">
                  <span
                    className="px-4 py-2 rounded text-sm font-medium cursor-pointer transition inline-block"
                    style={buttonPrimaryStyle}
                  >
                    {uploading ? "Uploading..." : "Upload File"}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
          {canSubmit && (
            <button
              onClick={() => handleStatusAction("submit")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={buttonPrimaryStyle}
            >
              Submit PO
            </button>
          )}

          {canApprove && (
            <button
              onClick={() => handleStatusAction("approve")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={buttonSuccessStyle}
            >
              Approve PO
            </button>
          )}

          {canReceive && (
            <button
              onClick={() => handleStatusAction("receive")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={buttonSuccessStyle}
            >
              Mark as Received
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => handleStatusAction("cancel")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={buttonDangerStyle}
            >
              Cancel PO
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onAction("edit")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={buttonNeutralStyle}
            >
              Edit PO
            </button>
          )}

          {canExport && (
            <button
              onClick={() => onAction("export")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={buttonDangerStyle}
            >
              📥 Download PDF
            </button>
          )}
        </div>

        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onClose={() => setToast({ visible: false, message: "", type: "success" })}
          />
        )}
      </div>
    </Modal>
  );
}

export default PODetailModal;
