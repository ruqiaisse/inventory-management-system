const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true
    },

    company: {
      type: String,
      default: "",
      trim: true
    },

    email: {
      type: String,
      unique: true,
      default: "",
      lowercase: true,
      trim: true
    },
    phone: {
      type: String
    },

    address: {
      type: String
    },

    isActive: {
      type: Boolean,
      default: true
    }, 

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);