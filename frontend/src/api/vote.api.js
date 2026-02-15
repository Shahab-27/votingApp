import axiosInstance from "./axiosInstance";

export const voteForCandidate = async (candidateId) => {
    const response = await axiosInstance.get(`/vote/${candidateId}`);
    return response.data;
};

export const removeVote = async () => {
    const response = await axiosInstance.post("/vote/remove");
    return response.data;
};
