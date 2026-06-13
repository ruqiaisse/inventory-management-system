const express = require("express");

const {
  getStockReport,
} = require("../controllers/reportController");

const router = express.Router();

// STOCK REPORT
router.get("/stock", getStockReport);

module.exports = router;