const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"]
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"]
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"]
    },

    minStock: {
      type: Number,
      default: 5,
      min: [0, "Min stock cannot be negative"]
    },

    unit: {
      type: String,
      enum: ["pcs", "kg", "box", "ltr", "set", "pack"],
      default: "pcs"
    },

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    expiryDate: {
      type: Date
    },

    image: {
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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);