const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
      unique: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
 },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Category", categorySchema);
