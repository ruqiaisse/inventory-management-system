function ExportButtons({ onExport, disabled }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onExport("pdf")}
          disabled={disabled}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export PDF
        </button>
        <button
          type="button"
          onClick={() => onExport("excel")}
          disabled={disabled}
          className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export Excel
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Export will use the selected report type and the current date range.
      </p>
    </div>
  );
}

export default ExportButtons;
