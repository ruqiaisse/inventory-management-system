import { Download, Printer, X } from "lucide-react";
import Modal from "../ui/Modal";
import SaleStatusBadge from "./SaleStatusBadge";

function InvoiceModal({ isOpen, onClose, invoice, onPrint, onDownload }) {
  if (!invoice) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {invoice.invoiceNumber}
            </h3>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Date: {formatDate(invoice.createdAt)}
            </p>
          </div>
          <SaleStatusBadge status={invoice.status} />
        </div>

        {/* Customer & Cashier Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              CUSTOMER
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {invoice.customer?.name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {invoice.customer?.phone}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              CASHIER
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {invoice.createdBy?.name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {invoice.createdBy?.email}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            ITEMS
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-tertiary)",
                    borderBottomWidth: "2px",
                  }}
                >
                  <th
                    className="px-4 py-3 text-left font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Product
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Qty
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Unit Price
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottomWidth: "1px",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                      {item.product?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--text-primary)" }}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div
          className="p-4 rounded-lg border"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-tertiary)",
          }}
        >
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Payment Method:</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {invoice.paymentMethod?.charAt(0).toUpperCase() + invoice.paymentMethod?.slice(1)}
              </span>
            </div>
            <div
              className="flex justify-between text-lg font-bold pt-3 border-t"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              <span>Grand Total:</span>
              <span style={{ color: "var(--primary-color)" }}>
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          {invoice.status === "completed" && (
            <>
              <button
                onClick={onPrint}
                className="flex-1 flex items-center justify-center gap-2 theme-btn-primary"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-2 theme-btn-success"
              >
                <Download size={16} />
                Download PDF
              </button>
            </>
          )}
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

export default InvoiceModal;
