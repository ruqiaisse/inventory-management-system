import { apiClient } from "../utils/api_helper";

export const getActivityLogs = async (module = null) => {
  const params = new URLSearchParams();
  if (module) params.append("module", module);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`/activity${query}`);

  return response.data;
};

export const clearActivityLogs = async () => {
  const response = await apiClient.delete("/activity");
  return response.data;
};
