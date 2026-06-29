import { X } from "lucide-react";

function Modal({ isOpen, onClose, title, children, footer, size = "md" }) {
  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="presentation"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
    >
      <div className={`w-full ${sizeClasses[size]} rounded-xl border shadow-2xl overflow-hidden transform transition-all duration-200 animate-scale-in`}
        style={{
          borderColor: "var(--card-border)",
          backgroundColor: "var(--modal-bg)",
          color: "var(--text-primary)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: "var(--border-color)",
          }}
        >
          <h2 className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto" style={{ color: "var(--text-primary)" }}>
          {children}
        </div>

        {/* Footer (if provided) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Modal;

