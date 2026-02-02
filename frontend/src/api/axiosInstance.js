import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000", // backend base URL
    withCredentials: true,             // 🔥 VERY IMPORTANT (send cookies)
    headers: {
        "Content-Type": "application/json"
    }
});

// 🔁 Global response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If token is invalid / expired
        if (error.response && error.response.status === 401) {
            // Optional: redirect to login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
