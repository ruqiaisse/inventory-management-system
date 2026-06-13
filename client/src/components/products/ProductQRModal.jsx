import Modal from "../ui/Modal";
import QRCodeDisplay from "../ui/QRCodeDisplay";

function ProductQRModal({ isOpen, onClose, product }) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} title="Product QR Code" onClose={onClose}>
      <div className="space-y-6">
        <QRCodeDisplay
          productId={product._id}
          productName={product.name}
          sku={product.sku}
        />
      </div>
    </Modal>
  );
}

export default ProductQRModal;
