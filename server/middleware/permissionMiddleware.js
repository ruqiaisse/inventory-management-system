const RolePermission = require("../models/RolePermission");
const UserPermission = require("../models/UserPermission");

const checkPermission = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const role = req.user.role;

      // 1. USER OVERRIDE FIRST
      const userPerm = await UserPermission.findOne({
        user: userId,
        action,
      });

      if (userPerm) {
        if (!userPerm.allowed) {
          return res.status(403).json({ message: "Access denied" });
        }
        return next();
      }

      // 2. ROLE PERMISSION
      const rolePerm = await RolePermission.findOne({
        role,
        action,
      });

      if (rolePerm && rolePerm.allowed) {
        return next();
      }

      return res.status(403).json({ message: "Access denied" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};

module.exports = checkPermission;