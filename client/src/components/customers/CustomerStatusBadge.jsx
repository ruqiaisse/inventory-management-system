function CustomerStatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return { bg: "var(--success-bg)", text: "var(--success-text)", border: "var(--success-border)" };
      case "inactive":
        return { bg: "var(--gray-bg)", text: "var(--gray-text)", border: "var(--gray-border)" };
      default:
        return { bg: "var(--gray-bg)", text: "var(--gray-text)", border: "var(--gray-border)" };
    }
  };

  const colors = getStatusColor();

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

export default CustomerStatusBadge;
