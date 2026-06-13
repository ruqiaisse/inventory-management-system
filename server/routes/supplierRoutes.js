const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const router = express.Router();

router.get("/", protect, getSuppliers);
router.get("/:id", protect, getSupplierById);
router.post("/", protect, allowRoles("admin", "manager"), createSupplier);
router.put("/:id", protect, allowRoles("admin", "manager"), updateSupplier);
router.delete("/:id", protect, allowRoles("admin"), deleteSupplier);

module.exports = router;