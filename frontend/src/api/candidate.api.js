import axiosInstance from "./axiosInstance";

// Get all candidates (public)
export const getAllCandidates = async () => {
    const response = await axiosInstance.get("/allCandidates");
    return response.data;
};

// Get vote count (public)
export const getVoteCount = async () => {
    const response = await axiosInstance.get("/vote/count");
    return response.data;
};

// Get current user's candidate profile (candidate only)
export const getSelfCandidateProfile = async () => {
    const response = await axiosInstance.get("/candidate/self");
    return response.data?.candidate ?? null;
};

// Upload image for candidate profile (candidate only). Returns url string or null.
export const uploadCandidateProfileImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);
    const res = await axiosInstance.post("/candidate/upload-image", formData);
    return res.data?.url ?? null;
};

// Update candidate (admin only)
export const updateCandidate = async (candidateId, data) => {
    const response = await axiosInstance.put(`/${candidateId}`, data);
    return response.data;
};
