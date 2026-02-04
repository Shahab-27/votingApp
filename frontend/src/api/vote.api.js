import axiosInstance from "./axiosInstance";

// 🗳️ Vote for a candidate (user only) - backend expects GET
export const voteForCandidate = async (candidateId) => {
    const response = await axiosInstance.get(`/vote/${candidateId}`);
    return response.data;
};
