import { useEffect, useMemo, useState } from "react";

function getToastStyles() {
  // Detect if dark mode is active
  const isDark = document.documentElement.classList.contains("dark") || 
                 document.documentElement.getAttribute("data-theme") === "dark";

  if (isDark) {
    // Dark mode: lighter backgrounds with good contrast
    return {
      success: { bg: "#064e3b", text: "#6ee7b7" },
      error: { bg: "#7f1d1d", text: "#fca5a5" },
      warning: { bg: "#78350f", text: "#fcd34d" },
    };
  }

  // Light mode: original light backgrounds with dark text
  return {
    success: { bg: "var(--color-success-light)", text: "var(--color-success)" },
    error: { bg: "var(--color-danger-light)", text: "var(--color-danger)" },
    warning: { bg: "var(--color-warning-light)", text: "var(--color-warning)" },
  };
}

function Toast({ message, type = "success", visible, isVisible, onClose }) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark") || 
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark") || 
                   document.documentElement.getAttribute("data-theme") === "dark";
      setIsDarkMode(dark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const variantStyles = useMemo(() => getToastStyles(), [isDarkMode]);
  // If no visibility prop is provided, assume the component mount means show.
  const show = (typeof visible === "undefined" && typeof isVisible === "undefined") ? true : (visible || isVisible);
  const style = variantStyles[type] || variantStyles.success;

  useEffect(() => {
    if (show && typeof onClose === "function") {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {message}
    </div>
  );
}

export default Toast;
