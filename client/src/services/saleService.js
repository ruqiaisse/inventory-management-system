import { apiClient } from "../utils/api_helper";

export const getSales = async (filters = {}) => {
  const { search, customerId, paymentMethod, status, startDate, endDate } = filters;
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (customerId) params.append("customerId", customerId);
  if (paymentMethod) params.append("paymentMethod", paymentMethod);
  if (status) params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`/sales${query}`);
  return response.data;
};

export const getSaleById = async (id) => {
  const response = await apiClient.get(`/sales/${id}`);
  return response.data;
};

export const createSale = async (data) => {
  const response = await apiClient.post("/sales", data);
  return response.data;
};

export const cancelSale = async (id) => {
  const response = await apiClient.put(`/sales/${id}/cancel`);
  return response.data;
};

export const deleteSale = async (id) => {
  const response = await apiClient.delete(`/sales/${id}`);
  return response.data;
};

export const getCustomerPurchaseHistory = async (customerId) => {
  const response = await apiClient.get(`/sales/customer/${customerId}/history`);
  return response.data;
};
