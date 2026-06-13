const ActivityLog = require("../models/ActivityLog");

// GET ALL ACTIVITY LOGS 
const getActivityLogs = async (req, res) => {
  try {
    const { module } = req.query;

    let filter = {};

    // Filter by module if provided
    if (module) {
      filter.module = module;
    }

    const logs = await ActivityLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE ALL ACTIVITY LOGS
const clearActivityLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});

    res.json({
      message: "Activity logs cleared",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getActivityLogs,
  clearActivityLogs,
};