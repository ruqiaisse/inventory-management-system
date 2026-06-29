import { apiClient } from "../utils/api_helper";

export const getCustomers = async (filters = {}) => {
  const { search, status } = filters;
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (status) params.append("status", status);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`/customers${query}`);
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await apiClient.post("/customers", data);
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await apiClient.delete(`/customers/${id}`);
  return response.data;
};
