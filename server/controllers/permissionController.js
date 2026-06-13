const RolePermission = require("../models/RolePermission");
const UserPermission = require("../models/UserPermission");

// GET /api/permissions/me - Get current user's effective permissions
exports.getMyPermissions = async (req, res) => {
  try {
    const rolePerms = await RolePermission.find({ role: req.user.role });
    const userPerms = await UserPermission.find({ user: req.user._id });

    const permissions = {};

    // First apply role permissions
    rolePerms.forEach((p) => {
      permissions[p.action] = p.allowed;
    });

    // Then override with user-specific permissions
    userPerms.forEach((p) => {
      permissions[p.action] = p.allowed;
    });

    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/permissions/role/:role - Get all permissions for a role
exports.getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;

    if (!["admin", "manager", "staff"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const permissions = await RolePermission.find({ role });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/permissions/role/:role - Update permissions for a role
exports.updateRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const updates = req.body; // Array of { action, allowed }

    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Body must be an array" });
    }

    if (!["admin", "manager", "staff"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const results = [];

    for (const update of updates) {
      const { action, allowed } = update;
      const updated = await RolePermission.findOneAndUpdate(
        { role, action },
        { role, action, allowed, updatedBy: req.user._id },
        { upsert: true, new: true }
      );
      results.push(updated);
    }

    res.json({ message: "Permissions updated", data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/permissions/user/:userId - Get user-specific permission overrides
exports.getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = await UserPermission.find({ user: userId });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/permissions/user/:userId - Set user-specific permission overrides
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body; // Array of { action, allowed }

    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Body must be an array" });
    }

    const results = [];

    for (const update of updates) {
      const { action, allowed } = update;
      const updated = await UserPermission.findOneAndUpdate(
        { user: userId, action },
        { user: userId, action, allowed, grantedBy: req.user._id },
        { upsert: true, new: true }
      );
      results.push(updated);
    }

    res.json({ message: "User permissions updated", data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};