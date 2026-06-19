import { useState } from "react";

function BarcodeScanner({ onScan, onClose, mode = "qr" }) {
  const [manualInput, setManualInput] = useState("");
  const [useCamera, setUseCamera] = useState(false);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput);
      setManualInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {mode === "barcode"
                ? "Scan or Enter Barcode"
                : "Scan or Enter QR Code"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Use your device camera or type manually
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>

        {useCamera ? (
          <div className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                📷 Camera access requires a modern browser with camera permissions.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                For best results, use the manual entry option below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseCamera(false)}
              className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              Back to Manual Entry
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Enter {mode === "barcode" ? "Barcode" : "QR Code"}
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={`Paste or type ${mode === "barcode" ? "barcode" : "QR code"} here...`}
                autoFocus
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setUseCamera(true)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                Try Camera
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Tip: Most barcode scanners will paste the code automatically when you focus this field
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default BarcodeScanner;