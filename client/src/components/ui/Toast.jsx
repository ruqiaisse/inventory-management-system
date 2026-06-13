import { useEffect } from "react";

const variantClasses = {
  success: "bg-emerald-100 text-emerald-800",
  error: "bg-rose-100 text-rose-800",
  warning: "bg-amber-100 text-amber-800",
};

function Toast({ message, type = "success", visible = false, isVisible = false, onClose }) {
  const show = visible || isVisible;

  useEffect(() => {
    if (show && typeof onClose === "function") {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl ${variantClasses[type] || variantClasses.success}`}>
      {message}
    </div>
  );
}

export default Toast;
