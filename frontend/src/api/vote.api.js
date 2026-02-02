import axiosInstance from "./axiosInstance";

// 🗳️ Vote for a candidate (user only)
export const voteForCandidate = async (candidateId) => {
    const response = await axiosInstance.post(`/vote/${candidateId}`);
    return response.data;
};
