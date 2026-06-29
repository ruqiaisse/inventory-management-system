function POStatusBadge({ status }) {
  const statusStyles = {
    draft: {
      backgroundColor: "var(--status-draft-bg)",
      color: "var(--status-draft-text)",
    },
    submitted: {
      backgroundColor: "var(--status-submitted-bg)",
      color: "var(--status-submitted-text)",
    },
    approved: {
      backgroundColor: "var(--status-approved-bg)",
      color: "var(--status-approved-text)",
    },
    received: {
      backgroundColor: "var(--status-received-bg)",
      color: "var(--status-received-text)",
    },
    cancelled: {
      backgroundColor: "var(--status-cancelled-bg)",
      color: "var(--status-cancelled-text)",
    },
  };

  const statusLabels = {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    received: "Received",
    cancelled: "Cancelled",
  };

  const badgeStyle = statusStyles[status] || statusStyles.draft;

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={badgeStyle}
    >
      {statusLabels[status] || "Unknown"}
    </span>
  );
}

export default POStatusBadge;
