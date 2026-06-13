import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

function ConfirmModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Are you sure?");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  useEffect(() => {
    const openHandler = (e) => {
      const detail = e.detail || {};
      setMessage(detail.message || "Are you sure?");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
      <div className="min-w-[320px] rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl shadow-slate-950/20">
        <div className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
