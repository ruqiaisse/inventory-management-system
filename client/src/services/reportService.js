import { apiClient } from "../utils/api_helper";

export const getStockReport = async (params = {}) => {
  const response = await apiClient.get("/reports/stock", { params });
  return response.data;
};

const downloadBlob = async (endpoint, filename, params = {}) => {
  const response = await apiClient.get(endpoint, {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportReport = async (reportType, format, params = {}) => {
  const endpoint = `/reports/${reportType}/${format}`;
  const filename = `${reportType}-report.${format === "pdf" ? "pdf" : "xlsx"}`;
  await downloadBlob(endpoint, filename, params);
};
