// Permission System - Dynamic role-based access control
// This schema manages permissions for different user roles
// Supports: admin, manager, staff roles with granular action control

const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    allowed: {
      type: Boolean,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

rolePermissionSchema.index({ role: 1, action: 1 }, { unique: true });

module.exports = mongoose.model("RolePermission", rolePermissionSchema);