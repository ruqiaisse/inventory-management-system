function POStatusBadge({ status }) {
  const statusStyles = {
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    submitted:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    approved:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    received:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  };

  const statusLabels = {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    received: "Received",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        statusStyles[status] || statusStyles.draft
      }`}
    >
      {statusLabels[status] || "Unknown"}
    </span>
  );
}

export default POStatusBadge;
