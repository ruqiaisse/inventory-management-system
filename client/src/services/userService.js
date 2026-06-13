import { apiClient } from "../utils/api_helper";

export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.role) params.append("role", filters.role);

  const url = params.toString() ? `/users?${params.toString()}` : "/users";
  const response = await apiClient.get(url);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};
