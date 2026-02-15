import axios from "axios";

// Prefer same-origin + Vite proxy in dev.

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "/api/v1";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies automatically with every request
    headers: {
        "Content-Type": "application/json"
    }
});

axiosInstance.interceptors.request.use((config) => {
    // When sending FormData, do NOT set Content-Type so browser sets multipart/form-data with boundary
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
        console.log("[axios] request (FormData - multipart)", { url: config.baseURL + config.url, method: config.method });
    } else {
        console.log("[axios] request", {
            url: config.baseURL + config.url,
            method: config.method,
            withCredentials: config.withCredentials,
        });
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => {
        console.log("[axios] response", {
            url: response.config?.baseURL + response.config?.url,
            status: response.status
        });
        return response;
    },
    (error) => {
        console.error("[axios] error", {
            url: error.config?.baseURL + error.config?.url,
            status: error.response?.status,
            data: error.response?.data
        });
        if (error.response?.status === 401) {
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
