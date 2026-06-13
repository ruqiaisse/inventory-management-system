const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", protect, getCategories);
router.get("/:id", protect, getCategoryById);
router.post("/", protect, allowRoles("admin", "manager"), createCategory);
router.put("/:id", protect, allowRoles("admin", "manager"), updateCategory);
router.delete("/:id", protect, allowRoles("admin"), deleteCategory);

module.exports = router;