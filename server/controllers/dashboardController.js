const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

// GET DASHBOARD SUMMARY
const getSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const lowStockProductsAgg = await Product.aggregate([
      {
        $match: { $expr: { $lte: ["$stock", "$minStock"] } },
      },
      { $count: "count" },
    ]);
    const lowStockProducts = (lowStockProductsAgg[0] && lowStockProductsAgg[0].count) || 0;

    const outOfStock = await Product.countDocuments({ stock: 0 });

    const totalCategories = await Category.countDocuments({ isActive: true });
    const totalSuppliers = await Supplier.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });

    const stockValueAgg = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ]);
    const totalStockValue = (stockValueAgg[0] && stockValueAgg[0].total) || 0;

    const recentActivity = await ActivityLog.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStock,
      totalCategories,
      totalSuppliers,
      totalUsers,
      totalStockValue,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChartData = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();

    const stockByCategoryAgg = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          itemCount: { $sum: 1 },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    const categoryMap = categories.reduce((acc, category) => {
      acc[category._id.toString()] = category.name;
      return acc;
    }, {});

    const stockByCategory = stockByCategoryAgg.map((item) => ({
      category: categoryMap[item._id?.toString()] || "Unknown",
      value: Math.round(item.totalValue),
      count: item.itemCount,
    }));

    const lowStock = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ["$stock", "$minStock"] },
    });
    const outOfStock = await Product.countDocuments({ isActive: true, stock: 0 });
    const inStock = await Product.countDocuments({
      isActive: true,
      $expr: { $gt: ["$stock", "$minStock"] },
      stock: { $gt: 0 },
    });

    const statusBreakdown = [
      { status: "In Stock", count: inStock },
      { status: "Low Stock", count: lowStock },
      { status: "Out of Stock", count: outOfStock },
    ];

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const trendAgg = await Product.aggregate([
      {
        $match: {
          isActive: true,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trendMap = trendAgg.reduce((acc, item) => {
      acc[item._id] = Math.round(item.totalValue);
      return acc;
    }, {});

    const stockValueTrend = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      day.setHours(0, 0, 0, 0);
      const label = day.toISOString().slice(0, 10);
      stockValueTrend.push({ date: label, value: trendMap[label] || 0 });
    }

    res.json({ stockValueTrend, stockByCategory, productStatus: statusBreakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary, getChartData };
