const express = require("express");

const router = express.Router();

const {
  getActivityLogs,
  clearActivityLogs,
} = require("../controllers/activityController");

// GET ALL ACTIVITY LOGS
router.get("/", getActivityLogs);

// DELETE ALL ACTIVITY LOGS
router.delete("/", clearActivityLogs);

module.exports = router;