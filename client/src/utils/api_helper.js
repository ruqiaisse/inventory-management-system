import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "InvenPro_auth_token";
const AUTH_USER_KEY = "InvenPro_auth_user";

const getStorage = () => {
  try {
    return window?.sessionStorage || window?.localStorage;
  } catch {
    return null;
  }
};

const storage = getStorage();

const encodeValue = (value) => {
  if (value === undefined || value === null) return "";
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  const encoded = btoa(unescape(encodeURIComponent(stringValue)));
  return encoded.split("").reverse().join("");
};

const decodeValue = (value) => {
  if (!value) return null;
  try {
    const reversed = value.split("").reverse().join("");
    const decoded = decodeURIComponent(escape(atob(reversed)));
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  if (!storage) return;
  storage.setItem(AUTH_TOKEN_KEY, encodeValue(token));
};

export const getToken = () => {
  if (!storage) return null;
  return decodeValue(storage.getItem(AUTH_TOKEN_KEY));
};

export const setUser = (user) => {
  if (!storage) return;
  storage.setItem(AUTH_USER_KEY, encodeValue(user));
};

export const getUser = () => {
  if (!storage) return null;
  return decodeValue(storage.getItem(AUTH_USER_KEY));
};

export const clearAuthData = () => {
  if (!storage) return;
  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(AUTH_USER_KEY);
};

export const normalizeError = (error) => {
  if (!error) return "Unexpected error occurred.";
  if (typeof error === "string") return error;
  if (error.normalizedMessage) return error.normalizedMessage;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return "Unexpected error occurred.";
};

export const getErrorMessage = (error) => normalizeError(error);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    error.normalizedMessage = normalizeError(error);
    return Promise.reject(error);
  }
);

