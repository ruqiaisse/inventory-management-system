const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

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

router.get("/", protect, getProducts);
router.get("/barcode/:code", protect, findByBarcode);
router.get("/:id/qr", protect, generateProductQR);
router.get("/:id", protect, getProductById);
router.post("/", protect, allowRoles("admin", "manager"), createProduct);
router.put("/:id", protect, allowRoles("admin", "manager"), updateProduct);
router.delete("/:id", protect, allowRoles("admin"), deleteProduct);

module.exports = router;