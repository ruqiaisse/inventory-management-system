const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const Customer = require("../models/Customer");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const StockLog = require("../models/StockLogs");
const Sale = require("../models/Sale");

const buildStockValueTrend = (currentValue, logs = [], productPrices = new Map()) => {
	const startDate = new Date();
	startDate.setHours(0, 0, 0, 0);
	startDate.setDate(startDate.getDate() - 6);

	const dateSeries = [];
	const dayChanges = [];

	for (let i = 0; i < 7; i++) {
		const start = new Date(startDate);
		start.setDate(startDate.getDate() + i);

		const end = new Date(start);
		end.setDate(end.getDate() + 1);

		const dayLogs = logs.filter((log) => log.createdAt >= start && log.createdAt < end);
		const dayChange = dayLogs.reduce((sum, log) => {
			const price = productPrices.get(String(log.product)) || 0;
			const multiplier = log.type === "add" ? 1 : -1;
			return sum + multiplier * (log.quantity || 0) * price;
		}, 0);

		dayChanges.push(dayChange);
		dateSeries.push({
			date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
		});
	}

	const values = [];
	let runningValue = Math.max(0, currentValue);

	for (let index = dayChanges.length - 1; index >= 0; index--) {
		values[index] = Math.max(0, runningValue);
		runningValue = Math.max(0, runningValue - dayChanges[index]);
	}

	return dateSeries.map((day, index) => ({ ...day, value: values[index] }));
};

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

		// Customers use `status: 'active'` in the schema (not `isActive`)
		const totalCustomers = await Customer.countDocuments({ status: "active" });
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

		// Recent sales (latest 5)
		const recentSales = await Sale.find()
			.populate("customer", "name")
			.sort({ createdAt: -1 })
			.limit(5);

		res.json({
			totalProducts,
			lowStockProducts,
			outOfStock,
			totalCustomers,
			totalSuppliers,
			totalUsers,
			totalStockValue,
			recentActivity,
			recentSales,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET DASHBOARD CHARTS
const getCharts = async (req, res) => {
	try {
		// Product status counts
		const statusAgg = await Product.aggregate([
			{
				$group: {
					_id: {
						$cond: [
							{ $eq: ["$stock", 0] },
							"Out of Stock",
							{ $cond: [{ $lte: ["$stock", "$minStock"] }, "Low Stock", "In Stock"] },
						],
					},
					count: { $sum: 1 },
				},
			},
		]);

		const productStatus = [
			{ status: "In Stock", count: 0 },
			{ status: "Low Stock", count: 0 },
			{ status: "Out of Stock", count: 0 },
		];

		statusAgg.forEach((s) => {
			const key = s._id;
			const idx = productStatus.findIndex((p) => p.status === key);
			if (idx !== -1) productStatus[idx].count = s.count;
		});

		// Stock by category (sum of stock per category)
		const stockByCatAgg = await Product.aggregate([
			{ $group: { _id: "$category", totalStock: { $sum: "$stock" } } },
			{
				$lookup: {
					from: "categories",
					localField: "_id",
					foreignField: "_id",
					as: "category",
				},
			},
			{ $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
			{ $project: { category: "$category.name", value: "$totalStock" } },
		]);

		const stockByCategory = stockByCatAgg.map((r) => ({ category: r.category || "Uncategorized", value: r.value || 0 }));

		// Stock value trend based on recent stock movement logs and current inventory value
		const stockValueAgg = await Product.aggregate([
			{ $group: { _id: null, total: { $sum: { $multiply: ["$price", "$stock"] } } } },
		]);
		const totalStockValue = (stockValueAgg[0] && stockValueAgg[0].total) || 0;

		const products = await Product.find({}, "_id price").lean();
		const productPrices = new Map(products.map((product) => [String(product._id), product.price]));

		const logs = await StockLog.find({
			createdAt: {
				$gte: new Date(new Date().setDate(new Date().getDate() - 6)),
				$lte: new Date(),
			},
		})
			.lean();

		const stockValueTrend = buildStockValueTrend(totalStockValue, logs, productPrices);

		res.json({ stockValueTrend, stockByCategory, productStatus });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};


module.exports = { getSummary, getCharts };
