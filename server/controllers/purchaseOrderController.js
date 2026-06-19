const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const StockLog = require("../models/StockLogs");
const ActivityLog = require("../models/ActivityLog");
const PDFDocument = require("pdfkit");
const Settings = require("../models/Settings");

// Auto-generate PO number
const generatePONumber = async () => {
  try {
    const count = await PurchaseOrder.countDocuments();
    const nextNumber = count + 1;
    const year = new Date().getFullYear();
    const poNumber = `PO-${year}-${String(nextNumber).padStart(3, "0")}`;
    return poNumber;
  } catch (err) {
    throw new Error("Failed to generate PO number");
  }
};

// CREATE PO
exports.createPO = async (req, res) => {
  try {
    const { supplier, items, notes } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!supplier || !items || items.length === 0) {
      return res.status(400).json({ message: "Supplier and items are required" });
    }

    // Calculate total amount
    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += item.quantity * item.unitPrice;
    });

    // Generate PO number
    const poNumber = await generatePONumber();

    // Create PO
    const po = new PurchaseOrder({
      poNumber,
      supplier,
      items,
      totalAmount,
      notes: notes || "",
      createdBy: userId,
      status: "draft",
    });

    await po.save();

    // Log activity
    await ActivityLog.create({
      action: "Created",
      module: "Purchase Orders",
      details: `Created PO: ${poNumber}`,
      user: userId,
    });

    // Populate before returning
   await po.populate([
  { path: "supplier" },
  { path: "createdBy" },
  { path: "items.product" },
]);
  

    res.status(201).json({
      message: "PO created successfully",
      data: po,
    });
  } catch (err) {
    console.error("Error creating PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET ALL POs
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const userRole = req.user.role;
    const userId = req.user._id;

    let filter = {};

    // Staff can only see approved and received POs
    if (userRole === "staff") {
      filter.status = { $in: ["approved", "received"] };
    }

    // Apply status filter if provided
    if (status) {
      filter.status = status;
    }

    const pos = await PurchaseOrder.find(filter)
      .populate("supplier createdBy approvedBy receivedBy")
      .sort({ createdAt: -1 });

    // Populate items
    for (let po of pos) {
      await po.populate("items.product");
    }

    res.json({
      data: pos,
    });
  } catch (err) {
    console.error("Error fetching POs:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE PO
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const po = await PurchaseOrder.findById(id)
      .populate("supplier createdBy approvedBy receivedBy")
      .populate("items.product");

    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    res.json({ data: po });
  } catch (err) {
    console.error("Error fetching PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PO (DRAFT ONLY)
exports.updatePO = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, items, notes } = req.body;
    const userId = req.user._id;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    // Only allow update if status is draft
    if (po.status !== "draft") {
      return res.status(400).json({ message: "Only draft POs can be edited" });
    }

    // Calculate new total amount
    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += item.quantity * item.unitPrice;
    });

    // Update PO
    po.supplier = supplier;
    po.items = items;
    po.totalAmount = totalAmount;
    po.notes = notes || "";

    await po.save();

    // Log activity
    await ActivityLog.create({
      action: "Updated",
      module: "Purchase Orders",
      details: `Updated PO: ${po.poNumber}`,
      user: userId,
    });

    await po.populate("supplier createdBy");

    res.json({
      message: "PO updated successfully",
      data: po,
    });
  } catch (err) {
    console.error("Error updating PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// SUBMIT PO
exports.submitPO = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    if (po.status !== "draft") {
      return res.status(400).json({ message: "Only draft POs can be submitted" });
    }

    po.status = "submitted";
    await po.save();

    // Log activity
    await ActivityLog.create({
      action: "Submitted",
      module: "Purchase Orders",
      details: `Submitted PO: ${po.poNumber}`,
      user: userId,
    });

    await po.populate("supplier createdBy approvedBy receivedBy");

    res.json({
      message: "PO submitted successfully",
      data: po,
    });
  } catch (err) {
    console.error("Error submitting PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// APPROVE PO
exports.approvePO = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    if (po.status !== "submitted") {
      return res.status(400).json({ message: "Only submitted POs can be approved" });
    }

    po.status = "approved";
    po.approvedBy = userId;
    po.approvedAt = new Date();
    await po.save();

    // Log activity
    await ActivityLog.create({
      action: "Approved",
      module: "Purchase Orders",
      details: `Approved PO: ${po.poNumber}`,
      user: userId,
    });

    await po.populate("supplier createdBy approvedBy receivedBy");

    res.json({
      message: "PO approved successfully",
      data: po,
    });
  } catch (err) {
    console.error("Error approving PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// RECEIVE PO
exports.receivePO = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const po = await PurchaseOrder.findById(id).populate("items.product");
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    if (po.status !== "approved") {
      return res.status(400).json({ message: "Only approved POs can be received" });
    }

    // Update stock for each item
    for (let item of po.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product.name}` });
      }

      const stockBefore = product.stock;
      const stockAfter = product.stock + item.quantity;

      // Update product stock
      product.stock = stockAfter;
      await product.save();

      // Create stock log
      await StockLog.create({
        product: item.product._id,
        type: "add",
        quantity: item.quantity,
        beforeStock: stockBefore,
        afterStock: stockAfter,
        note: `Received from PO: ${po.poNumber}`,
        user: userId,
      });
    }

    // Update PO status
    po.status = "received";
    po.receivedBy = userId;
    po.receivedAt = new Date();
    await po.save();

    // Log activity
    await ActivityLog.create({
      action: "Received",
      module: "Purchase Orders",
      details: `Received PO: ${po.poNumber}`,
      user: userId,
    });

    await po.populate("supplier createdBy approvedBy receivedBy");

    res.json({
      message: "PO received successfully",
      data: po,
    });
  } catch (err) {
    console.error("Error receiving PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// CANCEL PO
exports.cancelPO = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    // Can only cancel draft or submitted POs
    if (!["draft", "submitted"].includes(po.status)) {
      return res.status(400).json({ message: "Cannot cancel this PO" });
    }

    po.status = "cancelled";
    await po.save();

    // Log activity
    await ActivityLog.create({
      action: "Cancelled",
      module: "Purchase Orders",
      details: `Cancelled PO: ${po.poNumber}`,
      user: userId,
    });

    await po.populate("supplier createdBy approvedBy receivedBy");

    res.json({
      message: "PO cancelled successfully",
      data: po,
    });
  } catch (err) {
    console.error("Error cancelling PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE PO (DRAFT ONLY)
exports.deletePO = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    // Only allow delete if status is draft
    if (po.status !== "draft") {
      return res.status(400).json({ message: "Only draft POs can be deleted" });
    }

    const poNumber = po.poNumber;
    await PurchaseOrder.findByIdAndDelete(id);

    // Log activity
    await ActivityLog.create({
      action: "Deleted",
      module: "Purchase Orders",
      details: `Deleted PO: ${poNumber}`,
      user: userId,
    });

    res.json({
      message: "PO deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting PO:", err);
    res.status(500).json({ message: err.message });
  }
};

// UPLOAD FILE TO PO
exports.uploadPOFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    // Build file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    // Add to attachments
    po.attachments.push(fileUrl);
    await po.save();

    await po.populate("supplier createdBy approvedBy receivedBy");

    res.json({
      message: "File uploaded successfully",
      data: po,
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: err.message });
  }
};

// EXPORT PO AS PDF
exports.exportPOPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const po = await PurchaseOrder.findById(id)
      .populate("supplier createdBy approvedBy receivedBy")
      .populate("items.product");

    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    // Get company name from settings
    const settings = await Settings.findOne();
    const companyName = settings?.companyName || "Inventory System";

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${po.poNumber}.pdf"`);

    // Pipe to response
    doc.pipe(res);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("PURCHASE ORDER", { align: "center" });
    doc.moveDown(0.5);

    // Company info
    doc.fontSize(10).font("Helvetica").text(companyName, { align: "center" });
    doc.moveDown(1);

    // PO details
    doc.fontSize(12).font("Helvetica-Bold").text(`PO Number: ${po.poNumber}`);
    doc.fontSize(10).font("Helvetica").text(`Date: ${new Date(po.createdAt).toLocaleDateString()}`);
    doc.text(`Created By: ${po.createdBy?.name || "Unknown"}`);

    if (po.status === "approved") {
      doc.text(`Approved By: ${po.approvedBy?.name || "Unknown"}`);
      doc.text(`Approved Date: ${new Date(po.approvedAt).toLocaleDateString()}`);
    }

    if (po.status === "received") {
      doc.text(`Received By: ${po.receivedBy?.name || "Unknown"}`);
      doc.text(`Received Date: ${new Date(po.receivedAt).toLocaleDateString()}`);
    }

    doc.moveDown(1);

    // Supplier info
    doc.fontSize(12).font("Helvetica-Bold").text("Supplier Information");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name: ${po.supplier?.name || "N/A"}`);
    doc.text(`Email: ${po.supplier?.email || "N/A"}`);
    doc.text(`Phone: ${po.supplier?.phone || "N/A"}`);
    doc.moveDown(1);

    // Items table
    doc.fontSize(12).font("Helvetica-Bold").text("Items");
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 250;
    const col3X = 350;
    const col4X = 480;

    // Table header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Product", col1X, tableTop);
    doc.text("Qty", col2X, tableTop);
    doc.text("Unit Price", col3X, tableTop);
    doc.text("Total", col4X, tableTop);

    // Divider
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let yPosition = tableTop + 25;
    let itemTotal = 0;

    po.items.forEach((item) => {
      const itemAmount = item.quantity * item.unitPrice;
      itemTotal += itemAmount;

      doc.fontSize(10).font("Helvetica").text(
        item.product?.name || "Unknown Product",
        col1X,
        yPosition,
        { width: 180 }
      );
      doc.text(item.quantity.toString(), col2X, yPosition);
      doc.text(`$${item.unitPrice.toFixed(2)}`, col3X, yPosition);
      doc.text(`$${itemAmount.toFixed(2)}`, col4X, yPosition);

      yPosition += 30;
    });

    // Total divider
    doc.moveTo(50, yPosition - 10).lineTo(550, yPosition - 10).stroke();

    // Grand total
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text(`Grand Total: $${po.totalAmount.toFixed(2)}`, col4X - 60, yPosition + 10);

    // Status
    doc.moveDown(2);
    doc.fontSize(11).font("Helvetica-Bold").text(`Status: ${po.status.toUpperCase()}`);

    // Notes
    if (po.notes) {
      doc.moveDown(1);
      doc.fontSize(11).font("Helvetica-Bold").text("Notes:");
      doc.fontSize(10).font("Helvetica").text(po.notes);
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font("Helvetica").text("This is an auto-generated document.", { align: "center" });

    // End PDF
    doc.end();
  } catch (err) {
    console.error("Error exporting PDF:", err);
    res.status(500).json({ message: err.message });
  }
};
