const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

const {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  findByBarcode,
  generateProductQR,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", protect, checkPermission("products.view"), getProducts);
router.get("/barcode/:code", protect, checkPermission("products.view"), findByBarcode);
router.get("/:id/qr", protect, checkPermission("products.view"), generateProductQR);
router.get("/:id", protect, checkPermission("products.view"), getProductById);
router.post("/", protect, checkPermission("products.create"), createProduct);
router.put("/:id", protect, checkPermission("products.update"), updateProduct);
router.delete("/:id", protect, checkPermission("products.delete"), deleteProduct);

module.exports = router;