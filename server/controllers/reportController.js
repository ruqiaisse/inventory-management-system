const Product = require("../models/Product");

// STOCK REPORT
const getStockReport = async (req, res) => {
  try {
    const products = await Product.find();

    const totalProducts = products.length;

    const lowStock = products.filter(
      (product) => product.stock <= product.minStock
    );

    const totalValue = products.reduce(
      (acc, item) => acc + item.price * item.stock,
      0
    );

    res.json({
      totalProducts,
      lowStockCount: lowStock.length,
      totalValue,
      products,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getStockReport,
};