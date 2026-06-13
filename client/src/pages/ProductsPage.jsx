/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useCallback } from "react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import BarcodeScanner from "../components/ui/BarcodeScanner";
import ProductImageUpload from "../components/products/ProductImageUpload";
import ProductQRModal from "../components/products/ProductQRModal";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  findProductByBarcode,
} from "../services/productService";

import {
  getCategories,
} from "../services/categoryService";

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

      showToast("Product deleted");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  const handleScan = async (code) => {
    if (!code) {
      setShowScanner(false);
      return;
    }

    let parsedValue = code;
    try {
      const parsed = JSON.parse(code);
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
      const result = await findProductByBarcode(parsedValue);

      if (result.found) {
        const product = result.product;
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
          buttonText={can("products.create") ? "Create New Product" : undefined}
          onButtonClick={handleAdd}
        />

        {/* LOADING */}
        {loading && (
          <p className="mt-6">Loading products...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className="mt-6 text-red-500">{error}</p>
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
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 border rounded bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setScannerMode("search");
                  setShowScanner(true);
                }}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Scan to Find
              </button>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border rounded bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="mb-4 text-gray-500">
                  No products found
                </p>

                {can("products.create") && (
                  <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Create New Product
                  </button>
                )}
              </div>
            )}

            {/* TABLE */}
            {products.length > 0 && (
              <div className="mt-6 overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-100 text-gray-900 dark:bg-slate-900 dark:text-slate-100">
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
                          className={`border-b hover:bg-gray-50 text-slate-900 dark:border-slate-700 dark:hover:bg-slate-900 dark:text-slate-100 ${highlightedProductId === product._id ? "bg-amber-100 dark:bg-amber-500/20" : ""}`}
                        >
                          <td className="p-3">
                            {product.image ? (
                              <button
                                type="button"
                                onClick={() => window.open(product.image, "_blank")}
                                className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm"
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500">
                                —
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-sm">
                            {product.sku}
                          </td>
                          <td className="p-3 font-mono text-sm">
                            {product.barcode || "—"}
                          </td>
                          <td className="p-3 font-medium">
                            {product.name}
                          </td>
                          <td className="p-3">
                            <Badge type="info">
                              {product.category?.name}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {product.supplier?.name}
                          </td>
                          <td className="p-3">
                            <span
                              className={
                                product.stock === 0
                                  ? "text-red-600 font-medium"
                                  : product.stock <= product.minStock
                                  ? "text-amber-600 font-medium"
                                  : ""
                              }
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-3">
                            ${product.price?.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <Badge type={type}>
                              {label}
                            </Badge>
                          </td>
                          <td className="p-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setQrProduct(product);
                                setShowQRModal(true);
                              }}
                              className="bg-slate-200 text-slate-900 px-3 py-1 rounded text-sm hover:bg-slate-300"
                            >
                              QR
                            </button>
                            {can("products.update") ? (
                              <button
                                onClick={() => handleEdit(product)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                Edit
                              </button>
                            ) : (
                              <span className="text-slate-500 text-xs">No edit rights</span>
                            )}

                            {can("products.delete") ? (
                              <button
                                onClick={() =>
                                  handleDelete(product._id)
                                }
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                Delete
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
                <label className="block text-sm font-medium mb-1">
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  SKU *
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SKU-001"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode("fill-sku");
                      setShowScanner(true);
                    }}
                    className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 text-sm text-slate-900 hover:bg-slate-200"
                  >
                    Scan
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Product description"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium mb-1">
                  Supplier *
                </label>

                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Min Stock Level
                </label>

                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit
                </label>

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="box">box</option>
                  <option value="ltr">ltr</option>
                  <option value="set">set</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Barcode
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 text-sm text-slate-900 hover:bg-slate-200"
                  >
                    Generate
                  </button>
                </div>
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

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          <BarcodeScanner
            mode={scannerMode === "fill-sku" ? "qr" : "barcode"}
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
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
