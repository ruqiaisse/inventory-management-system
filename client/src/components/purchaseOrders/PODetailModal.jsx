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

  return (
    <Modal isOpen={isOpen} title="Purchase Order Details" onClose={onClose}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {po.poNumber}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Created: {new Date(po.createdAt).toLocaleDateString()}
              </p>
            </div>
            <POStatusBadge status={po.status} />
          </div>

          {po.createdBy && (
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Created by: <strong>{po.createdBy.name}</strong>
            </p>
          )}

          {po.approvedBy && po.approvedAt && (
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Approved by: <strong>{po.approvedBy.name}</strong> on{" "}
              {new Date(po.approvedAt).toLocaleDateString()}
            </p>
          )}

          {po.receivedBy && po.receivedAt && (
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Received by: <strong>{po.receivedBy.name}</strong> on{" "}
              {new Date(po.receivedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Supplier Info */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Supplier Information
          </h3>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
            <p className="text-slate-900 dark:text-slate-100">
              <strong>{po.supplier?.name}</strong>
            </p>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              Email: {po.supplier?.email || "N/A"}
            </p>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              Phone: {po.supplier?.phone || "N/A"}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
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

          {/* Grand Total */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Total:
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${po.totalAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {po.notes && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Notes
            </h3>
            <p className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-slate-700 dark:text-slate-300">
              {po.notes}
            </p>
          </div>
        )}

        {/* Attachments */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
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
                    className="block px-3 py-2 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:underline rounded text-sm truncate"
                  >
                    📄 {attachment.split("/").pop()}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No files attached</p>
            )}

            {canUpload && (
              <div>
                <label className="block">
                  <span className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm font-medium cursor-pointer transition inline-block">
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

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap pt-4 border-t border-slate-200 dark:border-slate-700">
          {canSubmit && (
            <button
              onClick={() => handleStatusAction("submit")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Submit PO
            </button>
          )}

          {canApprove && (
            <button
              onClick={() => handleStatusAction("approve")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
            >
              Approve PO
            </button>
          )}

          {canReceive && (
            <button
              onClick={() => handleStatusAction("receive")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
            >
              Mark as Received
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => handleStatusAction("cancel")}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition"
            >
              Cancel PO
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onAction("edit")}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
            >
              Edit PO
            </button>
          )}

          {canExport && (
            <button
              onClick={() => onAction("export")}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition"
            >
              📥 Download PDF
            </button>
          )}
        </div>

        {/* Toast */}
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
