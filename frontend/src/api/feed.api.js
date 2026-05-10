import axiosInstance from "./axiosInstance";

/** Get approved feed (optional auth for userLiked) */
export const getFeed = async () => {
    const res = await axiosInstance.get("/feed");
    return res.data?.feed ?? [];
};

/** Candidate: create campaign (image URL + caption). Upload image first via candidate.api uploadCandidateProfileImage. */
export const createCampaign = async (image, caption) => {
    const res = await axiosInstance.post("/feed/campaign", { image, caption: caption || "" });
    return res.data?.campaign ?? null;
};

/** Admin: get pending campaigns */
export const getPendingCampaigns = async () => {
    const res = await axiosInstance.get("/feed/pending");
    return res.data?.campaigns ?? [];
};

/** Admin: approve campaign */
export const approveCampaign = async (campaignId, remarks) => {
    const res = await axiosInstance.post(`/feed/pending/${campaignId}/approve`, { remarks });
    return res.data?.campaign;
};

/** Admin: disapprove campaign */
export const disapproveCampaign = async (campaignId, remarks) => {
    const res = await axiosInstance.post(`/feed/pending/${campaignId}/disapprove`, { remarks });
    return res.data?.campaign;
};

/** Like a post (returns { liked, likeCount }) */
export const likePost = async (campaignId) => {
    const res = await axiosInstance.post(`/feed/${campaignId}/like`);
    return res.data;
};

/** Remove like */
export const unlikePost = async (campaignId) => {
    const res = await axiosInstance.delete(`/feed/${campaignId}/like`);
    return res.data;
};

/** Candidate: get my campaigns */
export const getMyCampaigns = async () => {
    const res = await axiosInstance.get("/feed/my-campaigns");
    return res.data?.campaigns ?? [];
};

/** Candidate: turn campaign off/on (approved only) */
export const toggleCampaign = async (campaignId) => {
    const res = await axiosInstance.patch(`/feed/campaign/${campaignId}/toggle`);
    return res.data;
};

/** Candidate: delete own campaign */
export const deleteCampaign = async (campaignId) => {
    await axiosInstance.delete(`/feed/campaign/${campaignId}`);
};
