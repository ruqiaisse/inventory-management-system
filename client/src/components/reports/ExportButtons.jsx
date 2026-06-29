function ExportButtons({ onExport, disabled }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onExport("pdf")}
          disabled={disabled}
          className="rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "var(--text-primary)",
            color: "var(--text-inverse)",
            border: "1px solid var(--border-color)",
          }}
        >
          Export PDF
        </button>
        <button
          type="button"
          onClick={() => onExport("excel")}
          disabled={disabled}
          className="rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--text-inverse)",
            border: "1px solid var(--color-primary-dark)",
          }}
        >
          Export Excel
        </button>
      </div>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Export will use the selected report type and the current date range.
      </p>
    </div>
  );
}

export default ExportButtons;
