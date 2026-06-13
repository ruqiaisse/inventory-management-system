// PageHeader uses JSX but does not require default React import under new JSX transform

function PageHeader({ title, subtitle, action, buttonText, onButtonClick }) {
  const headerAction =
    action ||
    (buttonText ? (
      <button
        type="button"
        onClick={onButtonClick}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {buttonText}
      </button>
    ) : null);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
  );
}

export default PageHeader;
