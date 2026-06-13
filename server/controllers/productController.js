const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode");
const Product = require("../models/Product");
const { logActivity } = require("../utils/activityLogger");
const { translateError } = require("../utils/errorTranslator");


const getProducts = async (req, res) => {
  try {
    const { search, category, supplier, status } = req.query;

    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

        if (supplier) {
      filter.supplier = supplier;
    }

    // Status filters (MongoDB $expr for comparing two fields)
    if (status === "low") {
      filter.$expr = { $lte: ["$stock", "$minStock"] };
    } else if (status === "out") {
      filter.stock = 0;
    }

    const products = await Product.find(filter)
      .populate("category", "name") // only name
      .populate("supplier", "name email") // name and email
      .populate("createdBy", "name email") // name and email
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

const findByBarcode = async (req, res) => {
  try {
    const code = (req.params.code || "").trim();
    const product = await Product.findOne({ sku: { $regex: `^${code}$`, $options: "i" } })
      .populate("category", "name")
      .populate("supplier", "name email")
      .populate("createdBy", "name email");

    if (!product) {
      return res.json({ message: "Product not found", found: false });
    }

    res.json({ found: true, product });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

const generateProductQR = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const qrData = {
      id: product._id,
      sku: product.sku,
      name: product.name,
    };

    const qrCode = await qrcode.toDataURL(JSON.stringify(qrData));

    res.json({ qrCode });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({ message });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    // Check for duplicate SKU
    const existingSKU = await Product.findOne({ sku: req.body.sku });

    if (existingSKU) {
      return res.status(400).json({
        message: "SKU already exists",
      });
    }

    const productData = { ...req.body };
    if (productData.barcode === "" || productData.barcode == null) {
      delete productData.barcode;
    }

    // Set createdBy
    productData.createdBy = req.user ? req.user._id : undefined;

    const product = await Product.create(productData);

    // Log activity
    await logActivity(`Created product: ${product.name}`, "products", req.user ? req.user._id : null, `SKU: ${product.sku}`);

    res.status(201).json({
      message: "Product created",
      product,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

// GET SINGLE PRODUCT 
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name description") // name and description
      .populate("supplier", "name email phone") // name, email, phone
      .populate("createdBy", "name email"); // name and email

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // If SKU is being updated, check for duplicates
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingSKU = await Product.findOne({ sku: req.body.sku });
      if (existingSKU) {
        return res.status(400).json({
          message: "SKU already exists",
        });
      }
    }

    const updateData = { ...req.body };
    if (updateData.barcode === "" || updateData.barcode == null) {
      delete updateData.barcode;
    }

    if (
      updateData.image &&
      product.image &&
      updateData.image !== product.image
    ) {
      const oldFilename = path.basename(product.image);
      const oldPath = path.join("uploads", oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("category", "name description")
      .populate("supplier", "name email phone")
      .populate("createdBy", "name email");

    // Log activity
    await logActivity(`Updated product: ${updatedProduct.name}`, "products", req.user ? req.user._id : null);

    res.json(updatedProduct);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.image) {
      const filename = path.basename(product.image);
      const filePath = path.join("uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(`Deleted product: ${product.name}`, "products", req.user ? req.user._id : null, `SKU: ${product.sku}`);

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  findByBarcode,
  generateProductQR,
};
