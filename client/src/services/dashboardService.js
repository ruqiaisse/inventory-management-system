import { apiClient } from "../utils/api_helper";

export const getDashboardSummary = async () => {
  const response = await apiClient.get("/dashboard/summary");
  return response.data;
};

export const getDashboardCharts = async () => {
  const response = await apiClient.get("/dashboard/charts");
  return response.data;
};
