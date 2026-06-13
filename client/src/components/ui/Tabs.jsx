// Tabs does not require default React import

function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div>
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === tab.value
                ? "border-b-2 border-sky-600 text-sky-600"
                : "border-b-2 border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Tabs;