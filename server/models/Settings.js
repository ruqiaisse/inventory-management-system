const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "InvenPro",
      trim: true,
    },

    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "SOS"],
      default: "USD",
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    allowRegistration: {
      type: Boolean,
      default: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
