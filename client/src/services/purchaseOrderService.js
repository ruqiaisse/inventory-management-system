import { apiClient } from "../utils/api_helper";

export const getPurchaseOrders = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get("/purchase-orders", { params });
    return response.data?.data || [];
  } catch (err) {
    console.error("Error fetching purchase orders:", err);
    throw err;
  }
};

export const getPurchaseOrderById = async (id) => {
  try {
    const response = await apiClient.get(`/purchase-orders/${id}`);
    return response.data?.data || null;
  } catch (err) {
    console.error("Error fetching purchase order:", err);
    throw err;
  }
};

export const createPurchaseOrder = async (data) => {
  try {
    const response = await apiClient.post("/purchase-orders", data);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Error creating purchase order:", err);
    throw err;
  }
};

export const updatePurchaseOrder = async (id, data) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${id}`, data);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Error updating purchase order:", err);
    throw err;
  }
};

export const submitPO = async (id) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${id}/submit`);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Error submitting purchase order:", err);
    throw err;
  }
};

export const approvePO = async (id) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${id}/approve`);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Error approving purchase order:", err);
    throw err;
  }
};

export const receivePO = async (id) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${id}/receive`);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Error receiving purchase order:", err);
    throw err;
  }
};

export const cancelPO = async (id) => {
  try {
    const response = await apiClient.put(`/purchase-orders/${id}/cancel`);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Error cancelling purchase order:", err);
    throw err;
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    const response = await apiClient.delete(`/purchase-orders/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting purchase order:", err);
    throw err;
  }
};

export const uploadPOFile = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/purchase-orders/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

export const downloadPOPDF = async (id, poNumber) => {
  try {
    const response = await apiClient.get(`/purchase-orders/${id}/pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${poNumber}.pdf`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading PDF:", err);
    throw err;
  }
};
