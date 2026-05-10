import { Router } from "express";
import verifyJWT, { optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import {
    createCampaign,
    getFeed,
    getPendingCampaigns,
    approveCampaign,
    disapproveCampaign,
    likePost,
    unlikePost,
    getMyCampaigns,
    toggleCampaignActive,
    deleteCampaign,
} from "../controllers/feed.controller.js";

const feedRouter = Router();

// Feed: public (optional auth for userLiked) — candidate, admin, voter all can view
feedRouter.get("/feed", optionalVerifyJWT, getFeed);

// Candidate: create campaign (image URL + caption from body; upload image first via candidate/upload-image)
feedRouter.post("/feed/campaign", verifyJWT, createCampaign);
// Candidate: list own campaigns; turn off/on; delete
feedRouter.get("/feed/my-campaigns", verifyJWT, getMyCampaigns);
feedRouter.patch("/feed/campaign/:campaignId/toggle", verifyJWT, toggleCampaignActive);
feedRouter.delete("/feed/campaign/:campaignId", verifyJWT, deleteCampaign);

// Admin: pending campaigns
feedRouter.get("/feed/pending", verifyJWT, getPendingCampaigns);
feedRouter.post("/feed/pending/:campaignId/approve", verifyJWT, approveCampaign);
feedRouter.post("/feed/pending/:campaignId/disapprove", verifyJWT, disapproveCampaign);

// Like / unlike (authenticated)
feedRouter.post("/feed/:campaignId/like", verifyJWT, likePost);
feedRouter.delete("/feed/:campaignId/like", verifyJWT, unlikePost);

export default feedRouter;
