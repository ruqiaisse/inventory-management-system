import { apiClient } from "../utils/api_helper";

export const getDashboardSummary = async () => {
  const response = await apiClient.get("/dashboard/summary");
  return response.data;
};
