import { apiClient, setToken, setUser, getToken, getUser, clearAuthData } from "../utils/api_helper";

const AUTH_PATH = "/auth";

export const loginUser = async (data) => {
  const response = await apiClient.post(`${AUTH_PATH}/login`, data);
  const { token, user } = response.data;

  setToken(token);
  setUser(user);

  return response.data;
};

export const registerUser = async (data) => {
  const response = await apiClient.post(`${AUTH_PATH}/register`, data);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await apiClient.post(`${AUTH_PATH}/forgot-password`, data);
  return response.data;
};

export const resetPassword = async (token, data) => {
  const response = await apiClient.put(`${AUTH_PATH}/reset-password/${token}`, data);
  return response.data;
};

export const logoutUser = () => {
  clearAuthData();
};

export { getToken, getUser };

export const getMe = async () => {
  const response = await apiClient.get(`${AUTH_PATH}/me`);
  return response.data;
};