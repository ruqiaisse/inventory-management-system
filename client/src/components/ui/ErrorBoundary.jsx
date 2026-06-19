import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Filter out the specific html5-qrcode removeChild error
    if (
      error?.message?.includes("Failed to execute 'removeChild'") ||
      error?.message?.includes("The node to be removed")
    ) {
      return { hasError: false }; // Suppress this specific error
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log non-suppressed errors
    if (!error?.message?.includes("Failed to execute 'removeChild'")) {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm mt-1">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;