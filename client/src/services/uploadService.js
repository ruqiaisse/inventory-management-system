import { apiClient, getToken } from "../utils/api_helper";

export const uploadImage = async (file) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated. Please log in before uploading images.");
  }
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post("/upload", formData);

  return response.data.imageUrl;
};

export const deleteImage = async (filename) => {
  const response = await apiClient.delete("/upload", {
    data: { filename },
  });
  return response.data;
};
