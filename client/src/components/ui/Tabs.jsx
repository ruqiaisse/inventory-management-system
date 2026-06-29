

function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div>
      <div
        className="flex border-b mb-5 transition-colors"
        style={{ borderColor: "var(--border-color)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderBottomColor:
                activeTab === tab.value
                  ? "var(--color-primary)"
                  : "transparent",
              color:
                activeTab === tab.value
                  ? "var(--color-primary)"
                  : "var(--text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Tabs;