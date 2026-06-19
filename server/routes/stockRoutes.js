const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  addStock,
  deductStock,
  getStockLogs,
  getAllStockLogs,
  getStockSummary,
} = require("../controllers/stockController");

const router = express.Router();

// Add stock to a product
router.post("/:productId/add", protect, allowRoles("admin", "manager"), addStock);

// Deduct stock from a product
router.post("/:productId/deduct", protect, allowRoles("admin", "manager"), deductStock);

// Get stock logs for a specific product
router.get("/:productId/logs", protect, getStockLogs);

// Get all stock logs
router.get("/logs/all", protect, getAllStockLogs);

// Get stock summary
router.get("/summary", protect, getStockSummary);

module.exports = router;