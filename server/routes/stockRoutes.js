const express = require("express");

const router = express.Router();

const {
  addStock,
  deductStock,
} = require("../controllers/stockController");

const authMiddleware = require("../middleware/authMiddleware");

// ADD STOCK
router.post(
  "/:id/stock/add",
  authMiddleware,
  addStock
);

// DEDUCT STOCK
router.post(
  "/:id/stock/deduct",
  authMiddleware,
  deductStock
);

module.exports = router;