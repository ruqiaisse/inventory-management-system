export const getStockBadge = (stock, minStock = 10) => {
  if (stock === 0) return { type: "danger", label: "Out of stock" };
  if (stock <= minStock) return { type: "warning", label: "Low stock" };
  return { type: "success", label: "In stock" };
};

export const getRoleBadge = (role) => {
  if (role === "admin") return { type: "danger", label: "Admin" };
  if (role === "manager") return { type: "info", label: "Manager" };
  return { type: "gray", label: "Staff" };
};

