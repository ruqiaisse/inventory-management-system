import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function BarcodeScanner({ onScan, onClose, mode = "qr" }) {
  const [error, setError] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    setScannerReady(true);
  }, []);

  useEffect(() => {
    if (!scannerReady) {
      return;
    }

    console.log("[Scanner] Mounting, initializing scanner...");
    const node = document.getElementById("qr-reader");

    if (!node) {
      console.warn("[Scanner] qr-reader element not found");
      setError("Scanner container not ready. Please close and reopen scanner.");
      setInitializing(false);
      return;
    }

    let initTimeout;
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
      console.log("[Scanner] Scan success:", decodedText);
      scanner
        .clear()
        .then(() => {
          onScan(decodedText);
          onClose();
        })
        .catch((clearError) => {
          console.error("[Scanner] Unable to clear scanner after success:", clearError);
          onScan(decodedText);
          onClose();
        });
    };

    const onScanError = () => {
      // ignore scan errors while waiting for a valid read
    };

    initTimeout = setTimeout(() => {
      if (initializing) {
        console.warn("[Scanner] Init timeout after 5s");
        setError("Scanner is taking too long to initialize. Please check camera permissions.");
        setInitializing(false);
      }
    }, 5000);

    scanner
      .render(onScanSuccess, onScanError)
      .then(() => {
        console.log("[Scanner] Render successful, scanner ready");
        clearTimeout(initTimeout);
        setInitializing(false);
      })
      .catch((renderError) => {
        console.error("[Scanner] Init error:", renderError);
        clearTimeout(initTimeout);
        let msg = "Unable to access camera. Please check permissions and try again.";
        if (renderError.message?.includes("NotAllowedError")) {
          msg = "Camera access denied. Please allow camera permissions in your browser.";
        } else if (renderError.message?.includes("NotFoundError")) {
          msg = "No camera found. Please ensure a camera is connected.";
        }
        setError(msg);
        setInitializing(false);
      });

    return () => {
      console.log("[Scanner] Cleaning up");
      clearTimeout(initTimeout);
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => {
            // ignore cleanup errors
          });
      }
    };
  }, [onScan, onClose, scannerReady]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/20 p-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {mode === "barcode" ? "Point camera at barcode" : "Point camera at QR code"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hold steady until detected.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
        </div>

        <div id="qr-reader" className="relative h-[440px] rounded-3xl bg-slate-100">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-rose-50/90 p-4 text-center text-rose-700">
              {error}
            </div>
          )}
          {!error && initializing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-100/90 p-4 text-center">
              <p className="text-sm text-slate-500">Initializing camera...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
