

function PageHeader({ title, subtitle, action, buttonText, onButtonClick }) {
  const headerAction =
    action ||
    (buttonText ? (
      <button
        type="button"
        onClick={onButtonClick}
        className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
        style={{
          backgroundColor: "var(--button-primary-bg)",
          color: "var(--button-primary-text)",
        }}
      >
        {buttonText}
      </button>
    ) : null);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
  );
}

export default PageHeader;
