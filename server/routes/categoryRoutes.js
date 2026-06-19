const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

const {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", protect, checkPermission("categories.view"), getCategories);
router.get("/:id", protect, checkPermission("categories.view"), getCategoryById);
router.post("/", protect, checkPermission("categories.create"), createCategory);
router.put("/:id", protect, checkPermission("categories.update"), updateCategory);
router.delete("/:id", protect, checkPermission("categories.delete"), deleteCategory);

module.exports = router;