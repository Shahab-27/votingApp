import axios from "axios";
import { getToken, clearToken } from "../services/token.service";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/v1", // backend base URL
    withCredentials: true,             // 🔥 VERY IMPORTANT (send cookies)
    headers: {
        "Content-Type": "application/json"
    }
});

// 🔁 Request interceptor: attach JWT to authenticated requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔁 Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            clearToken();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
