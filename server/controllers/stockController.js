const Product = require("../models/Product");
const StockLog = require("../models/StockLogs");
const { logActivity } = require("../utils/activityLogger");
const { translateError } = require("../utils/errorTranslator");
const { sendLowStockAlert } = require("../utils/stockAlerts");

// ADD STOCK
const addStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, note } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const beforeStock = product.stock;
    const afterStock = beforeStock + quantity;

    // Update product stock
    product.stock = afterStock;
    await product.save();

    // Create stock log
    await StockLog.create({
      product: productId,
      type: "add",
      quantity,
      beforeStock,
      afterStock,
      user: req.user?._id,
      note: note || "",
    });

    await sendLowStockAlert(product, beforeStock, product.minStock);

    // Log activity
    await logActivity(
      `Added ${quantity} units to ${product.name}`,
      "stock",
      req.user?._id,
      `Before: ${beforeStock}, After: ${afterStock}`
    );

    res.json({
      message: "Stock added successfully",
      product,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// DEDUCT STOCK
const deductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, note } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    const beforeStock = product.stock;
    const afterStock = beforeStock - quantity;

    // Update product stock
    product.stock = afterStock;
    await product.save();

    // Create stock log
    await StockLog.create({
      product: productId,
      type: "deduct",
      quantity,
      beforeStock,
      afterStock,
      user: req.user?._id,
      note: note || "",
    });

    await sendLowStockAlert(product, beforeStock, product.minStock);

    // Log activity
    await logActivity(
      `Deducted ${quantity} units from ${product.name}`,
      "stock",
      req.user?._id,
      `Before: ${beforeStock}, After: ${afterStock}`
    );

    res.json({
      message: "Stock deducted successfully",
      product,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET STOCK LOGS FOR A PRODUCT
const getStockLogs = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const logs = await StockLog.find({ product: productId })
      .populate("product", "name sku")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await StockLog.countDocuments({ product: productId });

    res.json({
      total,
      count: logs.length,
      logs,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET ALL STOCK LOGS
const getAllStockLogs = async (req, res) => {
  try {
    const { limit = 100, skip = 0, startDate, endDate } = req.query;

    let filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const logs = await StockLog.find(filter)
      .populate("product", "name sku")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await StockLog.countDocuments(filter);

    res.json({
      total,
      count: logs.length,
      logs,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET STOCK SUMMARY
const getStockSummary = async (req, res) => {
  try {
    const products = await Product.find({});

    const summary = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      lowStockCount: products.filter((p) => p.stock <= p.minStock && p.stock > 0).length,
      outOfStockCount: products.filter((p) => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    };

    res.json(summary);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

module.exports = {
  addStock,
  deductStock,
  getStockLogs,
  getAllStockLogs,
  getStockSummary,
};