import { apiClient } from "../utils/api_helper";

export const getProducts = async (filters = {}) => {
  const { search, category, supplier, status } = filters;
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (supplier) params.append("supplier", supplier);
  if (status) params.append("status", status);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`/products${query}`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await apiClient.post("/products", data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

export const findProductByBarcode = async (code) => {
  const response = await apiClient.get(`/products/barcode/${encodeURIComponent(code)}`);
  return response.data;
};

export const getProductQR = async (id) => {
  const response = await apiClient.get(`/products/${id}/qr`);
  return response.data;
};
