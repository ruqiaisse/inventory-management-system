const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const { logActivity } = require("../utils/activityLogger");


// GET ALL
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE SUPPLIER
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE
const createSupplier = async (req, res) => {
  try {
    const existingEmail = await Supplier.findOne({ email: req.body.email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Supplier with this email already exists",
      });
    }

    const supplier = await Supplier.create({ ...req.body, createdBy: req.user ? req.user._id : undefined });

    // Log activity
    await logActivity(`Created supplier: ${supplier.name}`, "suppliers", req.user ? req.user._id : null);

    res.status(201).json({
      message: "Supplier created",
      supplier,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    // Check email uniqueness if email is changed
    if (
      req.body.email &&
      req.body.email !== supplier.email
    ) {
      const existingEmail = await Supplier.findOne({
        email: req.body.email,
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Log activity
    await logActivity(`Updated supplier: ${updatedSupplier.name}`, "suppliers", req.user ? req.user._id : null);

    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    const existingProduct = await Product.findOne({ supplier: supplier._id });
    if (existingProduct) {
      return res.status(400).json({
        message: "Cannot delete supplier while products reference it. Remove or reassign those products first.",
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(`Deleted supplier: ${supplier.name}`, "suppliers", req.user ? req.user._id : null);

    res.json({
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};