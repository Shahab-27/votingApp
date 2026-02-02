import axiosInstance from "./axiosInstance";

// 🔐 Login user (JWT will be set in HTTP-only cookie by backend)
export const loginUser = async (loginData) => {
    const response = await axiosInstance.post(
        "/login",
        loginData
    );
    return response.data;
};

// 🚪 Logout user (backend clears cookie)
export const logoutUser = async () => {
    const response = await axiosInstance.post("/logout");
    return response.data;
};

// 👤 Get logged-in user profile (used on page refresh)
export const getProfile = async () => {
    const response = await axiosInstance.get("/profile");
    return response.data;
};
