import axiosInstance from "./axiosInstance";

export const loginUser = async (data) => {
  console.log("[AuthAPI] loginUser -> /login", data);
  const res = await axiosInstance.post("/login", data);
  console.log("[AuthAPI] loginUser success", res.data);
  return res.data; // token in HTTP-only cookie, user in body
};

export const getProfile = async () => {
  console.log("[AuthAPI] getProfile -> /voterprofile");
  const res = await axiosInstance.get("/voterprofile");
  console.log("[AuthAPI] getProfile success", res.data);
  return res.data;
};

export const logoutUser = async () => {
  console.log("[AuthAPI] logoutUser -> /logout");
  await axiosInstance.post("/logout");
};

export const changePassword = async (data) => {
  console.log("[AuthAPI] changePassword -> /change-password");
  const res = await axiosInstance.post("/change-password", data);
  console.log("[AuthAPI] changePassword success", res.data);
  return res.data;
};

export const verifyEmailCode = async (code) => {
  console.log("[AuthAPI] verifyEmailCode -> /verify-email");
  const res = await axiosInstance.post("/verify-email", { code });
  console.log("[AuthAPI] verifyEmailCode success", res.data);
  return res.data;
};

export const resendVerificationEmail = async () => {
  console.log("[AuthAPI] resendVerificationEmail -> /resend-verification-email");
  const res = await axiosInstance.post("/resend-verification-email");
  console.log("[AuthAPI] resendVerificationEmail success", res.data);
  return res.data;
};

export const requestForgotPassword = async (email) => {
  console.log("[AuthAPI] requestForgotPassword -> /forgot-password");
  const res = await axiosInstance.post("/forgot-password", { email });
  console.log("[AuthAPI] requestForgotPassword success", res.data);
  return res.data;
};

export const resetPassword = async (payload) => {
  console.log("[AuthAPI] resetPassword -> /reset-password");
  const res = await axiosInstance.post("/reset-password", payload);
  console.log("[AuthAPI] resetPassword success", res.data);
  return res.data;
};
