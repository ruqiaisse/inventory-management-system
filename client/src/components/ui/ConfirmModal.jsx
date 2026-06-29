import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

function ConfirmModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Are you sure?");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [isDangerous, setIsDangerous] = useState(false);

  useEffect(() => {
    const openHandler = (e) => {
      const detail = e.detail || {};
      setMessage(detail.message || "Are you sure?");
      setIsDangerous(detail.isDangerous || false);
      setOnConfirm(() => () => {
        if (detail.onConfirm) detail.onConfirm();
      });
      setOpen(true);
    };

    const closeHandler = () => setOpen(false);

    window.addEventListener("open-confirm", openHandler);
    window.addEventListener("close-confirm", closeHandler);

    const esc = (ev) => {
      if (ev.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", esc);

    return () => {
      window.removeEventListener("open-confirm", openHandler);
      window.removeEventListener("close-confirm", closeHandler);
      window.removeEventListener("keydown", esc);
    };
  }, []);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={() => setOpen(false)}
      role="presentation"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
    >
      <div
        className="min-w-[320px] rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundColor: "var(--modal-bg)",
          borderColor: "var(--card-border)",
          border: "1px solid var(--card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Confirm Action
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4" style={{ color: "var(--text-primary)" }}>
          {message}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-6 py-4 border-t"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--button-secondary-bg)",
              color: "var(--button-secondary-text)",
              border: "1px solid var(--border-color)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: isDangerous
                ? "var(--color-danger)"
                : "var(--button-primary-bg)",
              color: "var(--text-inverse)",
            }}
          >
            {isDangerous ? "Delete" : "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
