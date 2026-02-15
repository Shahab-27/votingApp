import axiosInstance from "./axiosInstance";

export const uploadAadhaarDoc = async (file) => {
  if (!file) {
    console.log("[aadhaar.api] uploadAadhaarDoc called with no file, returning null");
    return null;
  }
  console.log("[aadhaar.api] Uploading file to /upload-aadhaar", {
    name: file.name,
    type: file.type,
    size: file.size
  });
  const formData = new FormData();
  formData.append("image", file);
  const res = await axiosInstance.post("/upload-aadhaar", formData);
  const url = res.data?.url || null;
  console.log("[aadhaar.api] Upload response:", url ? { url, success: true } : { success: false });
  return url;
};

export default uploadAadhaarDoc;

