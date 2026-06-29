const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();

// Create customer
router.post(
  "/",
  protect,
  checkPermission("customers.create"),
  createCustomer
);

// Get all customers
router.get("/", protect, checkPermission("customers.view"), getCustomers);

// Get single customer
router.get(
  "/:id",
  protect,
  checkPermission("customers.view"),
  getCustomerById
);

// Update customer
router.put(
  "/:id",
  protect,
  checkPermission("customers.update"),
  updateCustomer
);

// Delete customer
router.delete(
  "/:id",
  protect,
  checkPermission("customers.delete"),
  deleteCustomer
);

module.exports = router;
