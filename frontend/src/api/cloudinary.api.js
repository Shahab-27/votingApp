import axiosInstance from "./axiosInstance";

/**
 * Upload image via backend (uses backend Cloudinary API keys).
 * Backend endpoint: POST /upload-image (admin only), expects multipart field "image".
 */
export const uploadImageViaBackend = async (file) => {
  if (!file) return null;
  const formData = new FormData();
  formData.append("image", file);
  const res = await axiosInstance.post("/upload-image", formData);
  return res.data?.url || null;
};

export default uploadImageViaBackend;

