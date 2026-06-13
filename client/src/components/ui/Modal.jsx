// Modal component — default React import not required

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100"
          >
            ×
          </button>
        </div>

        <div className="p-5 text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

