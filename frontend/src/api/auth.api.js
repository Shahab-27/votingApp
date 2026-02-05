import axiosInstance from "./axiosInstance";

export const loginUser = async (data) => {
  const res = await axiosInstance.post("/login", data);
  return res.data; // token in HTTP-only cookie, user in body
};

export const getProfile = async () => {
  const res = await axiosInstance.get("/voterprofile");
  return res.data;
};

export const logoutUser = async () => {
  await axiosInstance.post("/logout");
};

export const changePassword = async (data) => {
  const res = await axiosInstance.post("/change-password", data);
  return res.data;
};
