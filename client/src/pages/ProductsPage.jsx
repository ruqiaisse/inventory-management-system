/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useCallback } from "react";
import { Edit2, Trash2, QrCode, Plus, FileText, FileSpreadsheet, Barcode } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import BarcodeScanner from "../components/ui/BarcodeScanner";
import ProductImageUpload from "../components/products/ProductImageUpload";
import ProductQRModal from "../components/products/ProductQRModal";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { useNavigate } from "react-router-dom";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  findProductByBarcode,
  getProductById,
} from "../services/productService";

import {
  getCategories,
} from "../services/categoryService";
import { exportReport } from "../services/reportService";

import { getUser } from "../services/authService";
import usePermission from "../hooks/usePermission";

import {
  getSuppliers,
} from "../services/supplierService";

import { getStockBadge } from "../utils/badgeHelpers";



const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qrProduct, setQrProduct] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState("search");
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [exporting, setExporting] = useState(false);

  

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");


  const user = getUser();
  const { can } = usePermission();

  const initialFormData = {
    name: "",
    sku: "",
    description: "",
    category: "",
    supplier: "",
    price: "",
    stock: "",
    minStock: "",
    unit: "pcs",
    image: "",
    barcode: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setSelectedProduct(null);
    setFormData(initialFormData);
  };

  // Debounce timer ref for filter changes
  const filterTimeoutRef = useRef(null);

  // LOAD DATA - only on component mount
  const fetchData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        getProducts({}),
        getCategories(),
        getSuppliers(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load data";
      setError(errorMsg);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mount only - fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // APPLY FILTERS with debounce to prevent excessive API calls
  const applyFilters = useCallback(async () => {
    try {
      const filters = {
        search: search || undefined,
        category: categoryFilter || undefined,
        supplier: supplierFilter || undefined,
        status: activeTab === "all" ? undefined : activeTab,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key]
      );

      const data = await getProducts(filters);
      setProducts(data);
      setError("");
    } catch (err) {
      const errorMsg = "Failed to apply filters";
      console.error(errorMsg, err);
      showToast(errorMsg, "error");
    }
  }, [search, categoryFilter, supplierFilter, activeTab]);

  // Debounced filter updates
  useEffect(() => {
    // Clear existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Set new timeout for debounced filter application
    filterTimeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 500); // Wait 500ms after user stops typing/selecting

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [search, categoryFilter, supplierFilter, activeTab, applyFilters]);

  // TOAST HELPER
  function showToast(message, type = "success") {
    setToast({
      visible: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 3000);
  }

  // OPEN ADD MODAL
  const handleAdd = () => {
    if (!can("products.create")) return;
    resetForm();
    setIsModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (product) => {
    if (!can("products.update")) return;
    setSelectedProduct(product);

    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      category: product.category?._id || "",
      supplier: product.supplier?._id || "",
      price: product.price || "",
      stock: product.stock || "",
      minStock: product.minStock || "",
      unit: product.unit || "pcs",
      image: product.image || "",
      barcode: product.barcode || "",
    });

    setIsModalOpen(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);

      applyFilters();

      showToast("Product deleted", "error");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      await exportReport("products", format);
      showToast(`Products ${format.toUpperCase()} export started`);
    } catch (err) {
      console.error("Export failed", err);
      showToast(err.response?.data?.message || "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleScan = async (code) => {
    if (!code) {
      setShowScanner(false);
      return;
    }

    let parsedValue = code;
    let scannedId = null;
    try {
      const parsed = JSON.parse(code);
      scannedId = parsed.id;
      parsedValue = parsed.sku || parsed.id || parsed.name || code;
    } catch {
      parsedValue = code;
    }

    if (scannerMode === "fill-sku") {
      setFormData((prev) => ({ ...prev, sku: parsedValue }));
      showToast(`SKU filled: ${parsedValue}`);
      setShowScanner(false);
      return;
    }

    try {
      let product = null;
      
      // If we have a product ID from QR code, search by ID first
      if (scannedId) {
        try {
          product = await getProductById(scannedId);
        } catch {
          // Fall back to barcode search if ID lookup fails
          const result = await findProductByBarcode(parsedValue);
          if (result.found) {
            product = result.product;
          }
        }
      } else {
        const result = await findProductByBarcode(parsedValue);
        if (result.found) {
          product = result.product;
        }
      }

      if (product) {
        setSearch(product.name || product.sku);
        setHighlightedProductId(product._id);
        showToast(`Found: ${product.name}`);

        setTimeout(() => {
          const row = document.getElementById(`product-${product._id}`);
          if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
      } else {
        showToast("No product found for this code", "error");
      }
    } catch {
      showToast("Search failed", "error");
    } finally {
      setShowScanner(false);
    }
  };

  // FORM CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const generateBarcode = () => {
    const randomCode = Math.floor(100000000000 + Math.random() * 900000000000);
    return `BC${randomCode}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: formData.stock === "" ? 0 : Number(formData.stock),
      minStock:
        formData.minStock === "" ? 0 : Number(formData.minStock),
      barcode: formData.barcode || null,
    };

    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct._id, payload);

        showToast("Product updated successfully");
      } else {
        await createProduct(payload);

        showToast("Product created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      applyFilters();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <PageHeader
          title="Products"
          action={
            <div className="flex flex-wrap gap-3 items-center">
              {can("products.create") && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="inline-flex items-center justify-center rounded-md theme-btn-primary"
                  title="Create New Product"
                >
                  <Plus size={16} className="mr-2" />
                  New
                </button>
              )}
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                disabled={exporting || !can("reports.export")}
                className="inline-flex items-center justify-center rounded-md theme-btn-danger"
                title="Export products as PDF"
              >
                <FileText size={16} className="mr-2" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => handleExport("excel")}
                disabled={exporting || !can("reports.export")}
                className="inline-flex items-center justify-center rounded-md theme-btn-success"
                title="Export products as Excel"
              >
                <FileSpreadsheet size={16} className="mr-2" />
                Excel
              </button>
            </div>
          }
        />

        {/* LOADING */}
        {loading && (
          <p className="mt-6">Loading products...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className="mt-6 theme-text-danger">{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* TABS */}
            <div className="mt-6">
              <Tabs
                tabs={[
                  { label: "All Products", value: "all" },
                  { label: "Low Stock", value: "low" },
                  { label: "Out of Stock", value: "out" },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* SEARCH & FILTERS */}
            <div className="mt-6 theme-card p-4 flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] theme-input"
              />
              <button
                type="button"
                onClick={() => {setShowScanner(true); setScannerMode("search");}}
                className="theme-btn-primary"
              >
                Scan Barcode
              </button>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="theme-input"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="theme-input"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            {/* EMPTY STATE */}
            {products.length === 0 && (
              <div className="mt-10 text-center">
                <p className="mb-4 theme-text-secondary">
                  No products found
                </p>

                {can("products.create") && (
                  <button
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center rounded-md theme-btn-primary"
                    title="Create New Product"
                  >
                    <Plus size={16} className="mr-2" />
                    Create New Product
                  </button>
                )}
              </div>
            )}

            {/* TABLE */}
            {products.length > 0 && (
              <div className="mt-6 overflow-x-auto theme-card">
                <table className="theme-table">
                  <thead className="theme-table-header">
                    <tr>
                      <th className="p-3 text-left">Image</th>
                      <th className="p-3 text-left">SKU</th>
                      <th className="p-3 text-left">Barcode</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Supplier</th>
                      <th className="p-3 text-left">Stock</th>
                      <th className="p-3 text-left">Price</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => {
                      const { type, label } = getStockBadge(
                        product.stock,
                        product.minStock
                      );

                      return (
                        <tr
                          id={`product-${product._id}`}
                          key={product._id}
                          className={`theme-table-row ${highlightedProductId === product._id ? "highlighted-row" : ""}`}
                        >
                          <td className="p-3">
                            {product.image ? (
                              <button
                                type="button"
                                onClick={() => window.open(product.image, "_blank")}
                                className="theme-icon-btn theme-icon-btn-secondary"
                                style={{ width: "2.5rem", height: "2.5rem" }}
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover rounded-full"
                                />
                              </button>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full theme-panel-muted theme-text-secondary text-xs">
                                —
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-sm theme-text-primary">
                            {product.sku}
                          </td>
                          <td className="p-3 font-mono text-sm theme-text-primary">
                            {product.barcode || "—"}
                          </td>
                          <td className="p-3 font-medium theme-text-primary">
                            {product.name}
                          </td>
                          <td className="p-3">
                            <Badge type="info">
                              {product.category?.name}
                            </Badge>
                          </td>
                          <td className="p-3 theme-text-secondary">
                            {product.supplier?.name}
                          </td>
                          <td className="p-3">
                            <span
                              className={
                                product.stock === 0
                                  ? "theme-text-danger font-medium"
                                  : product.stock <= product.minStock
                                  ? "theme-text-warning font-medium"
                                  : "theme-text-primary"
                              }
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-3 theme-text-primary">
                            ${product.price?.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <Badge type={type}>
                              {label}
                            </Badge>
                          </td>
                          <td className="p-3 flex gap-2 items-center">
                            {can("products.update") ? (
                              <button
                                onClick={() => handleEdit(product)}
                                className="theme-icon-btn theme-icon-btn-primary"
                                title="Edit Product"
                                style={{ width: "2.5rem", height: "2.5rem" }}
                              >
                                <Edit2 size={18} />
                              </button>
                            ) : (
                              <span className="theme-text-secondary text-xs">No edit</span>
                            )}

                            <button
                              onClick={() => {
                                setQrProduct(product);
                                setShowQRModal(true);
                              }}
                              className="theme-icon-btn theme-icon-btn-secondary"
                              title="View QR Code"
                              style={{ width: "2.5rem", height: "2.5rem" }}
                            >
                              <QrCode size={18} />
                            </button>

                            {can("products.delete") ? (
                              <button
                                onClick={() =>
                                  handleDelete(product._id)
                                }
                                className="theme-icon-btn theme-btn-danger"
                                title="Delete Product"
                                style={{ width: "2.5rem", height: "2.5rem" }}
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* MODAL */}
        <Modal
          isOpen={isModalOpen}
          title={
            selectedProduct ? "Edit Product" : "Add Product"
          }
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full theme-input"
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    SKU *
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      className="w-full theme-input"
                      placeholder="SKU-001"
                    />
                    
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 theme-text-primary">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full theme-input"
                  placeholder="Product description"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Category *
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full theme-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Supplier *
                  </label>

                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    required
                    className="w-full theme-input"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup._id} value={sup._id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Price *
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full theme-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full theme-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Min Stock Level
                  </label>

                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    min="0"
                    className="w-full theme-input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Unit
                  </label>

                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full theme-input"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="box">box</option>
                    <option value="ltr">ltr</option>
                    <option value="set">set</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 theme-text-primary">
                  Barcode
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full theme-input"
                    placeholder="Barcode"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        barcode: generateBarcode(),
                      }))
                    }
                    className="inline-flex items-center justify-center rounded-md theme-btn-secondary"
                    title="Generate barcode"
                  >
                    <Barcode size={16} className="mr-2" />
                    Generate
                  </button>
                </div>
              </div>

              <ProductImageUpload
                currentImage={selectedProduct?.image}
                onImageUploaded={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                onImageRemoved={() =>
                  setFormData((prev) => ({ ...prev, image: "" }))
                }
              />

            {/* Fixed action buttons at bottom */}
            <div className="flex gap-3 justify-end mt-6 border-t pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="theme-btn-secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="theme-btn-primary"
              >
                {selectedProduct ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>

        {/* QR MODAL */}
        <ProductQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          product={qrProduct}
        />

        {showScanner && (
            <ErrorBoundary>
          <BarcodeScanner
            mode={scannerMode === "fill-sku" ? "qr" : "barcode"}
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
          </ErrorBoundary>
        )}

        {/* TOAST */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              visible: false,
            }))
          }
        />
      </div>
    </MainLayout>
  );
};

export default ProductsPage;