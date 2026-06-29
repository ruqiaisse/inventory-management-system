const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

const {
  createSale,
  getSales,
  getSaleById,
  cancelSale,
  deleteSale,
  getCustomerPurchaseHistory,
} = require("../controllers/saleController");

const router = express.Router();

// Create sale
router.post("/", protect, checkPermission("sales.create"), createSale);

// Get all sales
router.get("/", protect, checkPermission("sales.view"), getSales);

// Get customer purchase history
router.get(
  "/customer/:customerId/history",
  protect,
  checkPermission("sales.view"),
  getCustomerPurchaseHistory
);

// Get single sale
router.get("/:id", protect, checkPermission("sales.view"), getSaleById);

// Cancel sale
router.put(
  "/:id/cancel",
  protect,
  checkPermission("sales.update"),
  cancelSale
);

// Delete sale
router.delete("/:id", protect, checkPermission("sales.delete"), deleteSale);

module.exports = router;
