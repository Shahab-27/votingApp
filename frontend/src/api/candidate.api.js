import axiosInstance from "./axiosInstance";

// 🗳️ Get all candidates (public)
export const getAllCandidates = async () => {
    const response = await axiosInstance.get("/allCandidates");
    return response.data;
};

// 📊 Get vote count (public)
export const getVoteCount = async () => {
    const response = await axiosInstance.get("/vote/count");
    return response.data;
};
