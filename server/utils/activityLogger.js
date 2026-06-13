const ActivityLog = require("../models/ActivityLog");

const logActivity = async (action, module, userId, details = "") => {
  try {
    const log = new ActivityLog({
      action,
      module,
      user: userId,
      details,
    });

    await log.save();
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

module.exports = { logActivity };
