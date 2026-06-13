const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

// GET DASHBOARD SUMMARY
const getSummary = async (req, res) => {
	try {
		const totalProducts = await Product.countDocuments();

		// low stock: stock <= minStock
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

module.exports = { getSummary };
