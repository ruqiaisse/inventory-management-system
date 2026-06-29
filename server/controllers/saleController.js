const Sale = require("../models/Sale");
const Product = require("../models/Product");
const StockLog = require("../models/StockLogs");
const Customer = require("../models/Customer");
const { logActivity } = require("../utils/activityLogger");
const { translateError } = require("../utils/errorTranslator");

// Helper function to generate invoice number
const generateInvoiceNumber = async () => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Count sales from current year
    const salesThisYear = await Sale.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31),
      },
    });

    const nextNumber = salesThisYear + 1;

    // Format: INV-2026-001, INV-2026-002, etc.
    const invoiceNumber = `INV-${currentYear}-${String(nextNumber).padStart(3, "0")}`;
    return invoiceNumber;
  } catch (error) {
    throw new Error("Failed to generate invoice number");
  }
};

// CREATE SALE
const createSale = async (req, res) => {
  try {
    const { customerId, items, paymentMethod } = req.body;

    // Validation
    if (!customerId || !items || items.length === 0 || !paymentMethod) {
      return res.status(400).json({
        message: "Customer, items, and payment method are required",
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Validate and process each item
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          message: "Each item must have a valid product ID and quantity",
        });
      }

      // Find product
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create sale
    const sale = new Sale({
      invoiceNumber,
      customer: customerId,
      items: processedItems,
      totalAmount,
      paymentMethod,
      createdBy: req.user._id,
    });

    // Save sale first
    await sale.save();

    // Deduct stock and create stock logs for each item
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      const stockBefore = product.stock;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      // Create stock log
      const stockLog = new StockLog({
        product: product._id,
        type: "deduct",
        quantity: item.quantity,
        beforeStock: stockBefore,
        afterStock: product.stock,
        user: req.user._id,
        note: `Sale: ${invoiceNumber}`,
      });

      await stockLog.save();
    }

    // Log activity
    await logActivity(
      "create",
      "sales",
      req.user._id,
      `Created Sale: ${invoiceNumber} - Customer: ${customer.name}`
    );

    // Populate and return sale
    await sale.populate([
      { path: "customer", select: "name phone customerCode" },
      { path: "items.product", select: "name sku price" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(201).json({
      message: "Sale created successfully",
      sale,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET ALL SALES
const getSales = async (req, res) => {
  try {
    const { search, customerId, paymentMethod, status, startDate, endDate } =
      req.query;

    let filter = {};

    // Search by invoice number
    if (search) {
      filter.invoiceNumber = { $regex: search, $options: "i" };
    }

    // Filter by customer
    if (customerId) {
      filter.customer = customerId;
    }

    // Filter by payment method
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(new Date(endDate).getTime() + 86400000); // Add 1 day
      }
    }

    const sales = await Sale.find(filter)
      .populate("customer", "name phone customerCode")
      .populate("items.product", "name sku price")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: sales.length,
      sales,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET SINGLE SALE
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer")
      .populate({
        path: "items.product",
        select: "name sku price stock category",
        populate: { path: "category", select: "name" },
      })
      .populate("createdBy", "name email");

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    res.json(sale);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// CANCEL SALE
const cancelSale = async (req, res) => {
  try {
    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    if (sale.status === "cancelled") {
      return res.status(400).json({
        message: "This sale has already been cancelled",
      });
    }

    // Restore stock for each item
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const stockBefore = product.stock;

        // Restore stock
        product.stock += item.quantity;
        await product.save();

        // Create stock log for restoration
        const stockLog = new StockLog({
          product: product._id,
          type: "add",
          quantity: item.quantity,
          beforeStock: stockBefore,
          afterStock: product.stock,
          user: req.user._id,
          note: `Sale Cancelled: ${sale.invoiceNumber}`,
        });

        await stockLog.save();
      }
    }

    // Update sale status
    sale.status = "cancelled";
    await sale.save();

    // Log activity
    await logActivity(
      "cancel",
      "sales",
      req.user._id,
      `Cancelled Sale: ${sale.invoiceNumber}`
    );

    await sale.populate([
      { path: "customer", select: "name phone customerCode" },
      { path: "items.product", select: "name sku price" },
      { path: "createdBy", select: "name email" },
    ]);

    res.json({
      message: "Sale cancelled successfully",
      sale,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// DELETE SALE
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    const invoiceNumber = sale.invoiceNumber;

    await Sale.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(
      "delete",
      "sales",
      req.user._id,
      `Deleted Sale: ${invoiceNumber}`
    );

    res.json({
      message: "Sale deleted successfully",
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET CUSTOMER PURCHASE HISTORY
const getCustomerPurchaseHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const sales = await Sale.find({
      customer: customerId,
      status: "completed",
    })
      .populate("items.product", "name sku price")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const totalPurchases = sales.length;
    const totalSpent = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const averageOrder = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    res.json({
      customer,
      totalPurchases,
      totalSpent,
      averageOrder,
      purchases: sales,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  cancelSale,
  deleteSale,
  getCustomerPurchaseHistory,
};
