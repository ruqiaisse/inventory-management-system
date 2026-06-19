const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProductsPdf,
  getProductsExcel,
  getStockPdf,
  getStockExcel,
  getCategoriesPdf,
  getCategoriesExcel,
  getSuppliersPdf,
  getSuppliersExcel,
  getActivityPdf,
  getActivityExcel,
} = require("../controllers/reportController");

const router = express.Router();

// Products Report
router.get("/products/pdf", protect, getProductsPdf);
router.get("/products/excel", protect, getProductsExcel);

// Stock Report
router.get("/stock/pdf", protect, getStockPdf);
router.get("/stock/excel", protect, getStockExcel);

// Categories Report
router.get("/categories/pdf", protect, getCategoriesPdf);
router.get("/categories/excel", protect, getCategoriesExcel);

// Suppliers Report
router.get("/suppliers/pdf", protect, getSuppliersPdf);
router.get("/suppliers/excel", protect, getSuppliersExcel);

// Activity Log Report
router.get("/activity/pdf", protect, getActivityPdf);
router.get("/activity/excel", protect, getActivityExcel);

module.exports = router;