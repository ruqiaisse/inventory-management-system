const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const ActivityLog = require("../models/ActivityLog");
const StockLog = require("../models/StockLogs"); // Make sure this model exists

const buildDateFilter = (query, field = "createdAt") => {
  const filter = {};

  if (query.fromDate) {
    const start = new Date(query.fromDate);
    start.setHours(0, 0, 0, 0);
    filter.$gte = start;
  }

  if (query.toDate) {
    const end = new Date(query.toDate);
    end.setHours(23, 59, 59, 999);
    filter.$lte = end;
  }

  return Object.keys(filter).length ? { [field]: filter } : {};
};

const createPdfResponse = (res, filename, title, columns, rows) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ margin: 25, size: "A4" });
  doc.pipe(res);

  // Title
  doc.fontSize(16).font("Helvetica-Bold").text(title, { align: "center" });
  doc.fontSize(10).fillColor("#666").text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
  doc.moveDown(1);

  // Table
  const tableTop = doc.y;
  const colWidths = calculateColumnWidths(columns);
  let currentY = tableTop;

  // Header row
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#000");
  let currentX = 25;

  columns.forEach((col, idx) => {
    doc.text(col.header, currentX, currentY, { width: colWidths[idx], align: "left" });
    currentX += colWidths[idx];
  });

  currentY += 20;

  // Divider line
  doc.moveTo(25, currentY - 5)
    .lineTo(570, currentY - 5)
    .stroke("#ccc");

  // Data rows
  doc.fontSize(8).font("Helvetica").fillColor("#333");
  
  rows.forEach((row) => {
    currentX = 25;
    columns.forEach((col, idx) => {
      const value = row[col.key] ?? "";
      doc.text(String(value), currentX, currentY, { width: colWidths[idx], align: "left" });
      currentX += colWidths[idx];
    });
    currentY += 16;

    // Page break if needed
    if (currentY > 750) {
      doc.addPage();
      currentY = 25;
    }
  });

  // Footer
  doc.fontSize(8).fillColor("#999");
  doc.text(`Total Records: ${rows.length}`, { align: "center" });

  doc.end();
};

const calculateColumnWidths = (columns) => {
  const totalWidth = 545; // A4 width minus margins
  const defaultWidth = totalWidth / columns.length;
  return columns.map((col) => col.width || defaultWidth);
};

const createExcelResponse = async (res, filename, sheetName, columns, rows, options = {}) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));

  // Set column definitions
  sheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width || 18,
  }));

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
  headerRow.alignment = { horizontal: "center", vertical: "center" };
  headerRow.height = 25;

  // Add data rows with conditional formatting
  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.addRow(row);
    excelRow.font = { size: 10 };
    excelRow.alignment = { horizontal: "left", vertical: "center", wrapText: true };

    // Low stock highlighting (if status column exists)
    if (options.statusKey && row[options.statusKey] === "Low Stock") {
      excelRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
    }
    // Out of stock highlighting
    if (options.statusKey && row[options.statusKey] === "Out of Stock") {
      excelRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };
      excelRow.font = { size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    }
  });

  // Add borders to all cells
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD3D3D3" } },
        left: { style: "thin", color: { argb: "FFD3D3D3" } },
        bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
        right: { style: "thin", color: { argb: "FFD3D3D3" } },
      };
    });
  });

  // Freeze header row
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
};

// ============= PRODUCTS REPORT =============
const getProductsPdf = async (req, res) => {
  try {
    const filter = buildDateFilter(req.query);
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name");

    const rows = products.map((product) => ({
      sku: product.sku,
      name: product.name,
      category: product.category?.name || "-",
      stock: product.stock,
      minStock: product.minStock,
      price: `$${product.price.toFixed(2)}`,
      status: product.stock === 0 ? "Out of Stock" : product.stock <= product.minStock ? "Low Stock" : "In Stock",
    }));

    const columns = [
      { header: "SKU", key: "sku", width: 80 },
      { header: "Name", key: "name", width: 120 },
      { header: "Category", key: "category", width: 80 },
      { header: "Stock", key: "stock", width: 50 },
      { header: "Min Stock", key: "minStock", width: 60 },
      { header: "Price", key: "price", width: 60 },
      { header: "Status", key: "status", width: 80 },
    ];

    createPdfResponse(res, "products-report.pdf", "Products Report", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsExcel = async (req, res) => {
  try {
    const filter = buildDateFilter(req.query);
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name");

    const rows = products.map((product) => ({
      sku: product.sku,
      name: product.name,
      category: product.category?.name || "-",
      stock: product.stock,
      minStock: product.minStock,
      price: product.price.toFixed(2),
      status: product.stock === 0 ? "Out of Stock" : product.stock <= product.minStock ? "Low Stock" : "In Stock",
    }));

    const columns = [
      { header: "SKU", key: "sku", width: 12 },
      { header: "Name", key: "name", width: 25 },
      { header: "Category", key: "category", width: 15 },
      { header: "Stock", key: "stock", width: 10 },
      { header: "Min Stock", key: "minStock", width: 12 },
      { header: "Price", key: "price", width: 12 },
      { header: "Status", key: "status", width: 15 },
    ];

    await createExcelResponse(res, "products-report.xlsx", "Products", columns, rows, { statusKey: "status" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= STOCK REPORT (FROM PRODUCTS) =============
const getStockPdf = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category", "name");

    const rows = products.map((product) => ({
      name: product.name,
      category: product.category?.name || "-",
      stock: product.stock,
      minStock: product.minStock,
      price: `$${product.price.toFixed(2)}`,
      status: product.stock === 0 ? "Out of Stock" : product.stock <= product.minStock ? "Low Stock" : "In Stock",
    }));

    const columns = [
      { header: "Name", key: "name", width: 150 },
      { header: "Category", key: "category", width: 100 },
      { header: "Current Stock", key: "stock", width: 80 },
      { header: "Min Stock", key: "minStock", width: 80 },
      { header: "Price", key: "price", width: 70 },
      { header: "Status", key: "status", width: 75 },
    ];

    createPdfResponse(res, "stock-report.pdf", "Stock Report", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockExcel = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category", "name");

    const rows = products.map((product) => ({
      name: product.name,
      category: product.category?.name || "-",
      stock: product.stock,
      minStock: product.minStock,
      price: product.price.toFixed(2),
      status: product.stock === 0 ? "Out of Stock" : product.stock <= product.minStock ? "Low Stock" : "In Stock",
    }));

    const columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Category", key: "category", width: 15 },
      { header: "Current Stock", key: "stock", width: 12 },
      { header: "Min Stock", key: "minStock", width: 12 },
      { header: "Price", key: "price", width: 12 },
      { header: "Status", key: "status", width: 15 },
    ];

    await createExcelResponse(res, "stock-report.xlsx", "Stock", columns, rows, { statusKey: "status" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ============= CATEGORIES REPORT =============
const getCategoriesPdf = async (req, res) => {
  try {
    const categories = await Category.find({});

    // Count products per category
    const rows = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ category: category._id });
        return {
          name: category.name,
          description: category.description || "-",
          count: count,
          status: category.isActive ? "Active" : "Inactive",
        };
      })
    );

    const columns = [
      { header: "Name", key: "name", width: 120 },
      { header: "Description", key: "description", width: 200 },
      { header: "Product Count", key: "count", width: 80 },
      { header: "Status", key: "status", width: 80 },
    ];

    createPdfResponse(res, "categories-report.pdf", "Categories Report", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoriesExcel = async (req, res) => {
  try {
    const categories = await Category.find({});

    const rows = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ category: category._id });
        return {
          name: category.name,
          description: category.description || "-",
          count: count,
          status: category.isActive ? "Active" : "Inactive",
        };
      })
    );

    const columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Description", key: "description", width: 30 },
      { header: "Product Count", key: "count", width: 15 },
      { header: "Status", key: "status", width: 12 },
    ];

    await createExcelResponse(res, "categories-report.xlsx", "Categories", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= SUPPLIERS REPORT =============
const getSuppliersPdf = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});

    const rows = await Promise.all(
      suppliers.map(async (supplier) => {
        const count = await Product.countDocuments({ supplier: supplier._id });
        return {
          name: supplier.name,
          email: supplier.email || "-",
          phone: supplier.phone || "-",
          count: count,
          status: supplier.isActive ? "Active" : "Inactive",
        };
      })
    );

    const columns = [
      { header: "Name", key: "name", width: 100 },
      { header: "Email", key: "email", width: 130 },
      { header: "Phone", key: "phone", width: 80 },
      { header: "Product Count", key: "count", width: 80 },
      { header: "Status", key: "status", width: 75 },
    ];

    createPdfResponse(res, "suppliers-report.pdf", "Suppliers Report", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSuppliersExcel = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});

    const rows = await Promise.all(
      suppliers.map(async (supplier) => {
        const count = await Product.countDocuments({ supplier: supplier._id });
        return {
          name: supplier.name,
          email: supplier.email || "-",
          phone: supplier.phone || "-",
          count: count,
          status: supplier.isActive ? "Active" : "Inactive",
        };
      })
    );

    const columns = [
      { header: "Name", key: "name", width: 18 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Product Count", key: "count", width: 15 },
      { header: "Status", key: "status", width: 12 },
    ];

    await createExcelResponse(res, "suppliers-report.xlsx", "Suppliers", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= ACTIVITY LOG REPORT =============
const getActivityPdf = async (req, res) => {
  try {
    const filter = buildDateFilter(req.query);
    const logs = await ActivityLog.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    const rows = logs.map((log) => ({
      date: new Date(log.createdAt).toLocaleDateString(),
      action: log.action,
      module: log.module,
      user: log.user?.name || "Unknown",
      details: log.details || "-",
    }));

    const columns = [
      { header: "Date", key: "date", width: 70 },
      { header: "Action", key: "action", width: 120 },
      { header: "Module", key: "module", width: 80 },
      { header: "User", key: "user", width: 100 },
      { header: "Details", key: "details", width: 175 },
    ];

    createPdfResponse(res, "activity-report.pdf", "Activity Log Report", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActivityExcel = async (req, res) => {
  try {
    const filter = buildDateFilter(req.query);
    const logs = await ActivityLog.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    const rows = logs.map((log) => ({
      date: new Date(log.createdAt).toLocaleDateString(),
      action: log.action,
      module: log.module,
      user: log.user?.name || "Unknown",
      details: log.details || "-",
    }));

    const columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Action", key: "action", width: 20 },
      { header: "Module", key: "module", width: 15 },
      { header: "User", key: "user", width: 18 },
      { header: "Details", key: "details", width: 30 },
    ];

    await createExcelResponse(res, "activity-report.xlsx", "Activity", columns, rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};