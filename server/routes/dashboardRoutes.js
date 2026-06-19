const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getSummary, getChartData } = require("../controllers/dashboardController");

router.get("/summary", protect, getSummary);
router.get("/charts", protect, getChartData);

module.exports = router;
