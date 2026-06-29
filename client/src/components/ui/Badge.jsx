
const typeMap = {
  success: { bg: "var(--color-success-light)", text: "var(--color-success)" },
  warning: { bg: "var(--color-warning-light)", text: "var(--color-warning)" },
  danger: { bg: "var(--color-danger-light)", text: "var(--color-danger)" },
  info: { bg: "var(--color-info-light)", text: "var(--color-info)" },
  gray: { bg: "var(--bg-tertiary)", text: "var(--text-secondary)" },
};

function Badge({ type = "gray", children }) {
  const style = typeMap[type] || typeMap.gray;
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
