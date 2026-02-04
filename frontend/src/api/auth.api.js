import axiosInstance from "./axiosInstance";

export const loginUser = async (data) => {
  const res = await axiosInstance.post("/login", data);
  return res.data;
};

export const getProfile = async () => {
  console.log("🔥 getProfile API CALLED");
  const res = await axiosInstance.get("/profile");
  return res.data;
};

export const logoutUser = async () => {
  await axiosInstance.post("/logout");
};
