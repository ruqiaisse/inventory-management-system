const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const router = express.Router();

router.get("/", protect, checkPermission("suppliers.view"), getSuppliers);
router.get("/:id", protect, checkPermission("suppliers.view"), getSupplierById);
router.post("/", protect, checkPermission("suppliers.create"), createSupplier);
router.put("/:id", protect, checkPermission("suppliers.update"), updateSupplier);
router.delete("/:id", protect, checkPermission("suppliers.delete"), deleteSupplier);

module.exports = router;