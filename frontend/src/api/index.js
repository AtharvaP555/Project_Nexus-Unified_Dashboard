import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("authToken", token);
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
    localStorage.removeItem("authToken");
  }
};

const token = localStorage.getItem("authToken");
if (token) {
  setAuthToken(token);
}

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/auth/token/", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserWidgets = async () => {
  const response = await apiClient.get("/widgets/");
  return response.data;
};

export const deleteUserWidget = async (widgetId) => {
  const response = await apiClient.delete(`/widgets/${widgetId}/`);
  return response.data;
};

export const updateWidgetOrder = async (widgetId, order) => {
  try {
    const response = await apiClient.patch(`/widgets/${widgetId}/`, {
      order: order,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating widget ${widgetId} order:`, error);
    throw error; // Re-throw to handle in the component
  }
};

export default apiClient;
