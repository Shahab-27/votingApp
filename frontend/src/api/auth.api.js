import axiosInstance from "./axiosInstance";
import { setToken, clearToken } from "../services/token.service";

export const loginUser = async (data) => {
  const res = await axiosInstance.post("/login", data);
  const { token, user } = res.data;
  if (token) setToken(token);
  return res.data;
};

export const getProfile = async () => {
  const res = await axiosInstance.get("/voterprofile");
  return res.data;
};

export const logoutUser = async () => {
  clearToken();
};
