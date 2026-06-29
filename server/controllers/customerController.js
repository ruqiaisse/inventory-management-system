const Customer = require("../models/Customer");
const { logActivity } = require("../utils/activityLogger");
const { translateError } = require("../utils/errorTranslator");

// Helper function to generate customer code
const generateCustomerCode = async () => {
  try {
    const lastCustomer = await Customer.findOne()
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;

    if (lastCustomer && lastCustomer.customerCode) {
      // Extract number from code like "CUS-0001"
      const match = lastCustomer.customerCode.match(/\d+/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    // Format with leading zeros (CUS-0001, CUS-0002, etc.)
    const code = `CUS-${String(nextNumber).padStart(4, "0")}`;
    return code;
  } catch (error) {
    throw new Error("Failed to generate customer code");
  }
};

const checkDuplicateCustomerIdentity = async ({ phone, email, excludeId }) => {
  const normalizedPhone = phone?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  const conditions = [];
  if (normalizedPhone) {
    conditions.push({ phone: normalizedPhone });
  }
  if (normalizedEmail) {
    conditions.push({ email: normalizedEmail });
  }

  if (conditions.length === 0) return null;

  const query = { $or: conditions };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Customer.findOne(query);
};

// CREATE CUSTOMER
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, status, notes } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone number are required",
      });
    }

    const duplicateCustomer = await checkDuplicateCustomerIdentity({ phone, email });
    if (duplicateCustomer) {
      if (duplicateCustomer.phone && phone?.trim() === duplicateCustomer.phone) {
        return res.status(400).json({ message: "Phone already exists" });
      }
      if (duplicateCustomer.email && email?.trim().toLowerCase() === duplicateCustomer.email) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Generate customer code
    const customerCode = await generateCustomerCode();

    // Create new customer
    const customer = new Customer({
      customerCode,
      name,
      phone,
      email: email ? email.trim().toLowerCase() : null,
      address: address || "",
      status: status || "active",
      notes: notes || "",
      createdBy: req.user._id,
    });

    await customer.save();

    // Log activity
    await logActivity(
      "create",
      "customers",
      req.user._id,
      `Created Customer: ${name}`
    );

    // Populate createdBy before returning
    await customer.populate("createdBy", "name email");

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET ALL CUSTOMERS
const getCustomers = async (req, res) => {
  try {
    const { search, status } = req.query;

    let filter = {};

    // Search by name or phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { customerCode: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    const customers = await Customer.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: customers.length,
      customers,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// GET SINGLE CUSTOMER
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, status, notes } = req.body;

    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const duplicateCustomer = await checkDuplicateCustomerIdentity({
      phone,
      email,
      excludeId: req.params.id,
    });

    if (duplicateCustomer) {
      if (duplicateCustomer.phone && phone?.trim() === duplicateCustomer.phone) {
        return res.status(400).json({ message: "Phone already exists" });
      }
      if (duplicateCustomer.email && email?.trim().toLowerCase() === duplicateCustomer.email) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Update fields if provided
    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (email !== undefined) customer.email = email ? email.trim().toLowerCase() : null;
    if (address !== undefined) customer.address = address;
    if (status) customer.status = status;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();

    // Log activity
    await logActivity(
      "update",
      "customers",
      req.user._id,
      `Updated Customer: ${customer.name}`
    );

    await customer.populate("createdBy", "name email");

    res.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const customerName = customer.name;

    await Customer.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(
      "delete",
      "customers",
      req.user._id,
      `Deleted Customer: ${customerName}`
    );

    res.json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
