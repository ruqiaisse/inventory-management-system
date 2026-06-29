import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

function BarcodeScanner({ onScan, onClose, mode = "qr" }) {
  const [manualInput, setManualInput] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput);
      setManualInput("");
    }
  };

  const cleanupCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        // ignore stop errors
      }
      try {
        await html5QrCodeRef.current.clear();
      } catch (err) {
        // ignore clear errors
      }
      html5QrCodeRef.current = null;
    }
  };

  useEffect(() => {
    if (!useCamera) {
      cleanupCamera();
      return;
    }

    let isMounted = true;
    const startCamera = async () => {
      setCameraError("");
      setIsCameraStarting(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported by this browser.");
        setIsCameraStarting(false);
        return;
      }

      if (!scannerRef.current) {
        setCameraError("Unable to start camera scanner.");
        setIsCameraStarting(false);
        return;
      }

      const elementId = scannerRef.current.id;
      const html5QrCode = new Html5Qrcode(elementId);
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            disableFlip: false,
          },
          (decodedText) => {
            if (!isMounted) return;
            onScan(decodedText);
            setUseCamera(false);
          },
          (errorMessage) => {
            // ignore decode errors during scanning
          }
        );
      } catch (err) {
        if (!isMounted) return;
        console.error("QR scanner failed to start:", err);
        setCameraError(
          err?.message || "Unable to access the camera. Please allow camera permissions."
        );
      } finally {
        if (isMounted) {
          setIsCameraStarting(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      cleanupCamera();
    };
  }, [useCamera, onScan]);

  const overlayStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  };

  const cardStyle = {
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    color: "var(--text-primary)",
  };

  const headerStyle = {
    borderColor: "var(--border-color)",
  };

  const actionButtonStyle = {
    backgroundColor: "var(--button-secondary-bg)",
    color: "var(--button-secondary-text)",
    border: "1px solid var(--border-color)",
  };

  const primaryButtonStyle = {
    backgroundColor: "var(--button-primary-bg)",
    color: "var(--button-primary-text)",
  };

  const inputStyle = {
    backgroundColor: "var(--panel-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--input-text)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={overlayStyle}>
      <div className="w-full max-w-md rounded-lg shadow-xl" style={cardStyle}>
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b" style={headerStyle}>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {mode === "barcode" ? "Scan or Enter Barcode" : "Scan or Enter QR Code"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="transition-colors rounded-full p-1 hover:opacity-80"
            style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-tertiary)" }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            Use your device camera or type manually
          </p>

          {useCamera ? (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--panel-bg)" }}>
                <div id="qr-reader" ref={scannerRef} className="h-72 bg-black" />
                <div className="p-4 text-center">
                  {isCameraStarting && (
                    <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                      Starting camera... Please allow camera access if prompted.
                    </p>
                  )}
                  {cameraError ? (
                    <p className="text-sm" style={{ color: "var(--color-danger)" }}>
                      {cameraError}
                    </p>
                  ) : (
                    !isCameraStarting && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Point your camera at a barcode or QR code and wait for it to scan.
                      </p>
                    )
                  )}
                </div>
              </div>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setUseCamera(false)}
                  className="w-full px-4 py-3 rounded-md transition"
                  style={actionButtonStyle}
                >
                  Back to Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCameraError("");
                    setUseCamera(false);
                    setTimeout(() => setUseCamera(true), 100);
                  }}
                  className="w-full px-4 py-3 rounded-md transition"
                  style={primaryButtonStyle}
                >
                  Retry Camera
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-bold" style={{ color: "var(--text-primary)" }}>
                  Enter {mode === "barcode" ? "Barcode" : "QR Code"}
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder={`Paste or type ${mode === "barcode" ? "barcode" : "QR code"} here...`}
                  autoFocus
                  className="w-full px-4 py-3 rounded-md focus:outline-none theme-input"
                  style={inputStyle}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-md transition"
                  style={primaryButtonStyle}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setUseCamera(true)}
                  className="flex-1 px-4 py-3 rounded-md transition"
                  style={actionButtonStyle}
                >
                  Try Camera
                </button>
              </div>

              <div className="text-xs text-center" style={{ color: "var(--text-tertiary)" }}>
                Tip: Most barcode scanners will paste the code automatically when you focus this field
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
