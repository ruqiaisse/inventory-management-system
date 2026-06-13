const Product = require("../models/Product");
const createActivity = require("../utils/createActivity");

// ADD STOCK
const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.stock += Number(quantity);

    await product.save();

    // activity log
    await createActivity(
      req.user._id,
      `Added ${quantity} stock to ${product.name}`,
      "products"
    );

    res.json({
      message: "Stock added successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DEDUCT STOCK
const deductStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    product.stock -= Number(quantity);

    await product.save();

    // activity log
    await createActivity(
      req.user._id,
      `Deducted ${quantity} stock from ${product.name}`,
      "products"
    );

    res.json({
      message: "Stock deducted successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addStock,
  deductStock,
};