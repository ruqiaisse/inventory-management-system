const Category = require("../models/Category");
const Product = require("../models/Product");
const { logActivity } = require("../utils/activityLogger");
const { translateError } = require("../utils/errorTranslator");


// GET ALL
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

// GET SINGLE CATEGORY
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

// CREATE
const createCategory = async (req, res) => {
  try {
    // Check for duplicate name
    const existingCategory = await Category.findOne({ name: req.body.name });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category name already exists",
      });
    }

    const category = await Category.create({ ...req.body, createdBy: req.user ? req.user._id : undefined });

    // Log activity
    await logActivity(`Created category: ${category.name}`, "categories", req.user ? req.user._id : null);

    res.status(201).json({
      message: "Category created",
      category,
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

// UPDATE
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Check for duplicate name if name is being updated
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ name: req.body.name });
      if (existingCategory) {
        return res.status(400).json({
          message: "Category name already exists",
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Log activity
    await logActivity(`Updated category: ${updatedCategory.name}`, "categories", req.user ? req.user._id : null);

    res.json(updatedCategory);
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

// DELETE
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. ${productCount} product(s) are using this category. Remove or reassign those products first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(`Deleted category: ${category.name}`, "categories", req.user ? req.user._id : null);

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    const { status, message } = translateError(error);
    res.status(status).json({
      message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};