import { useEffect, useState } from "react";
import { getProductQR } from "../../services/productService";

function QRCodeDisplay({ productId, productName, sku }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQr = async () => {
      try {
        const data = await getProductQR(productId);
        setQrDataUrl(data.qrCode);
      } catch (error) {
        console.error("Unable to load QR code", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadQr();
    }
  }, [productId]);

  const downloadQr = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `QR-${sku}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Unable to download QR code", error);
      alert("Unable to download QR code. Please try again.");
    }
  };

  const printLabel = () => {
    if (!qrDataUrl) return;

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const printDocument = printFrame.contentWindow?.document;
    if (!printDocument) {
      document.body.removeChild(printFrame);
      alert("Unable to open printer preview. Please try again.");
      return;
    }

    printDocument.write(`
      <html>
        <head>
          <title>Product Label — ${sku}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            img { width: 200px; height: 200px; }
            h2 { font-size: 18px; margin: 16px 0 4px; }
            p { font-size: 14px; color: #444; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${qrDataUrl}" alt="QR Code" />
          <h2>${productName}</h2>
          <p>SKU: ${sku}</p>
        </body>
      </html>
    `);

    printDocument.close();

    const printWindow = printFrame.contentWindow;
    printWindow?.focus();
    printWindow?.print();
    setTimeout(() => {
      if (printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
    }, 1000);
  };

  if (loading) {
    return <p>Loading QR code...</p>;
  }

  return (
    <div className="space-y-4 text-center" style={{ color: "var(--text-primary)" }}>
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt={`QR code for ${productName}`}
          className="mx-auto h-52 w-52 rounded-3xl border p-2"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-bg)",
          }}
        />
      ) : (
        <div
          className="rounded-3xl border p-16"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--panel-bg)",
            color: "var(--text-secondary)",
          }}
        >
          QR code unavailable
        </div>
      )}
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {productName}
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          SKU: {sku}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={downloadQr}
          className="rounded-lg px-4 py-2 text-sm transition hover:opacity-90"
          style={{
            backgroundColor: "var(--text-primary)",
            color: "var(--text-inverse)",
            border: "1px solid var(--border-color)",
          }}
        >
          Download QR
        </button>
        <button
          type="button"
          onClick={printLabel}
          className="rounded-lg px-4 py-2 text-sm transition hover:opacity-90"
          style={{
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        >
          Print Label
        </button>
      </div>
    </div>
  );
}

export default QRCodeDisplay;
