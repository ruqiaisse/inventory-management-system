const mongoose = require("mongoose");

const userPermissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

userPermissionSchema.index({ user: 1, action: 1 }, { unique: true });

module.exports = mongoose.model("UserPermission", userPermissionSchema);