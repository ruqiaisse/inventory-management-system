const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getMyPermissions,
  getRolePermissions,
  updateRolePermissions,
  getUserPermissions,
  updateUserPermissions,
} = require("../controllers/permissionController");

// Get current user's effective permissions (all users)
router.get("/me", protect, getMyPermissions);

// Role permission management (admin only)
router.get("/role/:role", protect, adminOnly, getRolePermissions);
router.put("/role/:role", protect, adminOnly, updateRolePermissions);

// User permission overrides (admin only)
router.get("/user/:userId", protect, adminOnly, getUserPermissions);
router.put("/user/:userId", protect, adminOnly, updateUserPermissions);

module.exports = router;