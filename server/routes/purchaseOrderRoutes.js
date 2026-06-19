const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const upload = require("../config/multer");

const {
  createPO,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePO,
  submitPO,
  approvePO,
  receivePO,
  cancelPO,
  deletePO,
  uploadPOFile,
  exportPOPDF,
} = require("../controllers/purchaseOrderController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// CREATE PO
router.post("/", allowRoles("admin", "manager"), createPO);

// GET ALL POs
router.get("/", getPurchaseOrders);

// GET SINGLE PO
router.get("/:id", getPurchaseOrderById);

// UPDATE PO (DRAFT ONLY)
router.put("/:id", allowRoles("admin", "manager"), updatePO);

// SUBMIT PO
router.put("/:id/submit", allowRoles("admin", "manager"), submitPO);

// APPROVE PO
router.put("/:id/approve", allowRoles("admin", "manager"), approvePO);

// RECEIVE PO
router.put("/:id/receive", allowRoles("admin", "manager", "staff"), receivePO);

// CANCEL PO
router.put("/:id/cancel", allowRoles("admin", "manager"), cancelPO);

// DELETE PO (DRAFT ONLY, ADMIN ONLY)
router.delete("/:id", allowRoles("admin"), deletePO);

// UPLOAD FILE TO PO
router.post(
  "/:id/upload",
  allowRoles("admin", "manager", "staff"),
  upload.single("file"),
  uploadPOFile
);

// EXPORT PO AS PDF
router.get("/:id/pdf", allowRoles("admin", "manager"), exportPOPDF);

module.exports = router;
