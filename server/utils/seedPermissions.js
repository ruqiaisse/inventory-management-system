const RolePermission = require("../models/RolePermission");

const defaultPermissions = [
  // PRODUCTS
  { role: "admin", action: "products.view", allowed: true },
  { role: "admin", action: "products.create", allowed: true },
  { role: "admin", action: "products.update", allowed: true },
  { role: "admin", action: "products.delete", allowed: true },
  { role: "admin", action: "products.export", allowed: true },
  
  { role: "manager", action: "products.view", allowed: true },
  { role: "manager", action: "products.create", allowed: true },
  { role: "manager", action: "products.update", allowed: true },
  { role: "manager", action: "products.delete", allowed: false },
  { role: "manager", action: "products.export", allowed: true },
  
  { role: "staff", action: "products.view", allowed: true },
  { role: "staff", action: "products.create", allowed: false },
  { role: "staff", action: "products.update", allowed: false },
  { role: "staff", action: "products.delete", allowed: false },
  { role: "staff", action: "products.export", allowed: false },

  // CATEGORIES
  { role: "admin", action: "categories.view", allowed: true },
  { role: "admin", action: "categories.create", allowed: true },
  { role: "admin", action: "categories.update", allowed: true },
  { role: "admin", action: "categories.delete", allowed: true },
  
  { role: "manager", action: "categories.view", allowed: true },
  { role: "manager", action: "categories.create", allowed: true },
  { role: "manager", action: "categories.update", allowed: true },
  { role: "manager", action: "categories.delete", allowed: false },
  
  { role: "staff", action: "categories.view", allowed: true },
  { role: "staff", action: "categories.create", allowed: false },
  { role: "staff", action: "categories.update", allowed: false },
  { role: "staff", action: "categories.delete", allowed: false },

  // CUSTOMERS
  { role: "admin", action: "customers.view", allowed: true },
  { role: "admin", action: "customers.create", allowed: true },
  { role: "admin", action: "customers.update", allowed: true },
  { role: "admin", action: "customers.delete", allowed: true },

  { role: "manager", action: "customers.view", allowed: true },
  { role: "manager", action: "customers.create", allowed: true },
  { role: "manager", action: "customers.update", allowed: true },
  { role: "manager", action: "customers.delete", allowed: false },

  { role: "staff", action: "customers.view", allowed: true },
  { role: "staff", action: "customers.create", allowed: false },
  { role: "staff", action: "customers.update", allowed: false },
  { role: "staff", action: "customers.delete", allowed: false },

  // SUPPLIERS
  { role: "admin", action: "suppliers.view", allowed: true },
  { role: "admin", action: "suppliers.create", allowed: true },
  { role: "admin", action: "suppliers.update", allowed: true },
  { role: "admin", action: "suppliers.delete", allowed: true },
  
  { role: "manager", action: "suppliers.view", allowed: true },
  { role: "manager", action: "suppliers.create", allowed: true },
  { role: "manager", action: "suppliers.update", allowed: true },
  { role: "manager", action: "suppliers.delete", allowed: false },
  
  { role: "staff", action: "suppliers.view", allowed: true },
  { role: "staff", action: "suppliers.create", allowed: false },
  { role: "staff", action: "suppliers.update", allowed: false },
  { role: "staff", action: "suppliers.delete", allowed: false },

  // SALES
  { role: "admin", action: "sales.view", allowed: true },
  { role: "admin", action: "sales.create", allowed: true },
  { role: "admin", action: "sales.update", allowed: true },
  { role: "admin", action: "sales.delete", allowed: true },

  { role: "manager", action: "sales.view", allowed: true },
  { role: "manager", action: "sales.create", allowed: true },
  { role: "manager", action: "sales.update", allowed: true },
  { role: "manager", action: "sales.delete", allowed: false },

  { role: "staff", action: "sales.view", allowed: true },
  { role: "staff", action: "sales.create", allowed: true },
  { role: "staff", action: "sales.update", allowed: false },
  { role: "staff", action: "sales.delete", allowed: false },

  // STOCK
  { role: "admin", action: "stock.view", allowed: true },
  { role: "admin", action: "stock.add", allowed: true },
  { role: "admin", action: "stock.deduct", allowed: true },
  
  { role: "manager", action: "stock.view", allowed: true },
  { role: "manager", action: "stock.add", allowed: true },
  { role: "manager", action: "stock.deduct", allowed: true },
  
  { role: "staff", action: "stock.view", allowed: true },
  { role: "staff", action: "stock.add", allowed: true },
  { role: "staff", action: "stock.deduct", allowed: true },

  // USERS
  { role: "admin", action: "users.view", allowed: true },
  { role: "admin", action: "users.create", allowed: true },
  { role: "admin", action: "users.update", allowed: true },
  { role: "admin", action: "users.delete", allowed: true },
  
  { role: "manager", action: "users.view", allowed: false },
  { role: "manager", action: "users.create", allowed: false },
  { role: "manager", action: "users.update", allowed: false },
  { role: "manager", action: "users.delete", allowed: false },
  
  { role: "staff", action: "users.view", allowed: false },
  { role: "staff", action: "users.create", allowed: false },
  { role: "staff", action: "users.update", allowed: false },
  { role: "staff", action: "users.delete", allowed: false },

  // REPORTS
  { role: "admin", action: "reports.view", allowed: true },
  { role: "admin", action: "reports.export", allowed: true },
  
  { role: "manager", action: "reports.view", allowed: true },
  { role: "manager", action: "reports.export", allowed: true },
  
  { role: "staff", action: "reports.view", allowed: false },
  { role: "staff", action: "reports.export", allowed: false },

  // SETTINGS
  { role: "admin", action: "settings.view", allowed: true },
  { role: "admin", action: "settings.update", allowed: true },
  
  { role: "manager", action: "settings.view", allowed: false },
  { role: "manager", action: "settings.update", allowed: false },
  
  { role: "staff", action: "settings.view", allowed: false },
  { role: "staff", action: "settings.update", allowed: false },

  // ACTIVITY
  { role: "admin", action: "activity.view", allowed: true },
  { role: "admin", action: "activity.clear", allowed: true },
  
  { role: "manager", action: "activity.view", allowed: true },
  { role: "manager", action: "activity.clear", allowed: false },
  
  { role: "staff", action: "activity.view", allowed: false },
  { role: "staff", action: "activity.clear", allowed: false },

  // PURCHASE ORDERS
  { role: "admin", action: "purchase-orders.create", allowed: true },
  { role: "admin", action: "purchase-orders.view", allowed: true },
  { role: "admin", action: "purchase-orders.update", allowed: true },
  { role: "admin", action: "purchase-orders.submit", allowed: true },
  { role: "admin", action: "purchase-orders.approve", allowed: true },
  { role: "admin", action: "purchase-orders.receive", allowed: true },
  { role: "admin", action: "purchase-orders.cancel", allowed: true },
  { role: "admin", action: "purchase-orders.delete", allowed: true },
  { role: "admin", action: "purchase-orders.upload", allowed: true },
  { role: "admin", action: "purchase-orders.export", allowed: true },
  
  { role: "manager", action: "purchase-orders.create", allowed: true },
  { role: "manager", action: "purchase-orders.view", allowed: true },
  { role: "manager", action: "purchase-orders.update", allowed: true },
  { role: "manager", action: "purchase-orders.submit", allowed: true },
  { role: "manager", action: "purchase-orders.approve", allowed: true },
  { role: "manager", action: "purchase-orders.receive", allowed: true },
  { role: "manager", action: "purchase-orders.cancel", allowed: true },
  { role: "manager", action: "purchase-orders.delete", allowed: false },
  { role: "manager", action: "purchase-orders.upload", allowed: true },
  { role: "manager", action: "purchase-orders.export", allowed: true },
  
  { role: "staff", action: "purchase-orders.create", allowed: false },
  { role: "staff", action: "purchase-orders.view", allowed: true },
  { role: "staff", action: "purchase-orders.update", allowed: false },
  { role: "staff", action: "purchase-orders.submit", allowed: false },
  { role: "staff", action: "purchase-orders.approve", allowed: false },
  { role: "staff", action: "purchase-orders.receive", allowed: true },
  { role: "staff", action: "purchase-orders.cancel", allowed: false },
  { role: "staff", action: "purchase-orders.delete", allowed: false },
  { role: "staff", action: "purchase-orders.upload", allowed: true },
  { role: "staff", action: "purchase-orders.export", allowed: false },
];

const seedPermissions = async () => {
  try {
    for (const perm of defaultPermissions) {
      await RolePermission.findOneAndUpdate(
        { role: perm.role, action: perm.action },
        perm,
        { upsert: true, new: true }
      );
    }

    console.log("Permissions seeded successfully");
  } catch (err) {
    console.error("Seeder error:", err.message);
  }
};

module.exports = seedPermissions;