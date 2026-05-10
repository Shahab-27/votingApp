import Campaign from "../models/campaign.model.js";
import Candidate from "../models/candidates.model.js";
import voter from "../models/voter.model.js";

const checkAdminRole = async (userId) => {
    const user = await voter.findById(userId).select("role");
    return user?.role === "admin";
};

/** Candidate: create campaign (image + caption), status = pending */
export const createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);
        if (!user || user.role !== "candidate") {
            return res.status(403).json({ error: "Only candidates can create campaigns" });
        }
        const candidate = await Candidate.findOne({ voter: user._id });
        if (!candidate) {
            return res.status(400).json({ error: "Complete your candidate profile first" });
        }
        const { image, caption } = req.body;
        if (!image || !image.trim()) {
            return res.status(400).json({ error: "Image URL is required" });
        }
        const campaign = await Campaign.create({
            candidate: candidate._id,
            image: image.trim(),
            caption: caption ? String(caption).trim() : "",
            status: "pending",
        });
        const populated = await Campaign.findById(campaign._id).populate("candidate", "name party candidateImage");
        return res.status(201).json({ campaign: populated });
    } catch (err) {
        console.error("[createCampaign]", err);
        return res.status(500).json({ error: "Failed to create campaign" });
    }
};

/** Public or authenticated: list approved campaigns for feed (newest first) */
export const getFeed = async (req, res) => {
    try {
        const campaigns = await Campaign.find({
            status: "approved",
            $or: [{ isActive: { $exists: false } }, { isActive: true }],
        })
            .populate("candidate", "name party candidateImage")
            .sort({ createdAt: -1 })
            .lean();
        const userId = req.user?.id;
        const list = campaigns.map((c) => {
            const likes = c.likes || [];
            const likeCount = likes.length;
            const userLiked = userId ? likes.some((l) => l.voter && l.voter.toString() === userId) : false;
            const { likes: _, ...rest } = c;
            return { ...rest, likeCount, userLiked };
        });
        return res.status(200).json({ feed: list });
    } catch (err) {
        console.error("[getFeed]", err);
        return res.status(500).json({ error: "Failed to load feed" });
    }
};

/** Admin: list pending campaigns for approval */
export const getPendingCampaigns = async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: "Admin only" });
        const list = await Campaign.find({ status: "pending" })
            .populate("candidate", "name party candidateImage")
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ campaigns: list });
    } catch (err) {
        console.error("[getPendingCampaigns]", err);
        return res.status(500).json({ error: "Failed to load pending campaigns" });
    }
};

/** Admin: approve campaign */
export const approveCampaign = async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: "Admin only" });
        const { campaignId } = req.params;
        const { remarks } = req.body || {};
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ error: "Campaign not found" });
        if (campaign.status !== "pending") {
            return res.status(400).json({ error: "Campaign is not pending" });
        }
        campaign.status = "approved";
        campaign.reviewedBy = req.user.id;
        campaign.reviewedAt = new Date();
        if (remarks != null) campaign.approvalRemarks = String(remarks);
        await campaign.save();
        return res.status(200).json({ campaign });
    } catch (err) {
        console.error("[approveCampaign]", err);
        return res.status(500).json({ error: "Failed to approve campaign" });
    }
};

/** Admin: reject campaign */
export const disapproveCampaign = async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: "Admin only" });
        const { campaignId } = req.params;
        const { remarks } = req.body || {};
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ error: "Campaign not found" });
        if (campaign.status !== "pending") {
            return res.status(400).json({ error: "Campaign is not pending" });
        }
        campaign.status = "rejected";
        campaign.reviewedBy = req.user.id;
        campaign.reviewedAt = new Date();
        if (remarks != null) campaign.approvalRemarks = String(remarks);
        await campaign.save();
        return res.status(200).json({ campaign });
    } catch (err) {
        console.error("[disapproveCampaign]", err);
        return res.status(500).json({ error: "Failed to reject campaign" });
    }
};

/** Voter (or any authenticated user): like a post. Idempotent. */
export const likePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { campaignId } = req.params;
        const campaign = await Campaign.findOne({ _id: campaignId, status: "approved" });
        if (!campaign) return res.status(404).json({ error: "Post not found or not approved" });
        const already = campaign.likes.some((l) => l.voter && l.voter.toString() === userId);
        if (!already) {
            campaign.likes.push({ voter: userId });
            await campaign.save();
        }
        const likeCount = campaign.likes.length;
        return res.status(200).json({ liked: true, likeCount });
    } catch (err) {
        console.error("[likePost]", err);
        return res.status(500).json({ error: "Failed to like post" });
    }
};

/** Candidate: list own campaigns (all statuses) */
export const getMyCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);
        if (!user || user.role !== "candidate") {
            return res.status(403).json({ error: "Candidate only" });
        }
        const candidate = await Candidate.findOne({ voter: user._id });
        if (!candidate) return res.status(200).json({ campaigns: [] });
        const campaigns = await Campaign.find({ candidate: candidate._id })
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ campaigns });
    } catch (err) {
        console.error("[getMyCampaigns]", err);
        return res.status(500).json({ error: "Failed to load campaigns" });
    }
};

/** Candidate: turn campaign off (hide from feed) or on */
export const toggleCampaignActive = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);
        if (!user || user.role !== "candidate") {
            return res.status(403).json({ error: "Candidate only" });
        }
        const candidate = await Candidate.findOne({ voter: user._id });
        if (!candidate) return res.status(404).json({ error: "Candidate profile not found" });
        const { campaignId } = req.params;
        const campaign = await Campaign.findOne({ _id: campaignId, candidate: candidate._id });
        if (!campaign) return res.status(404).json({ error: "Campaign not found" });
        if (campaign.status !== "approved") {
            return res.status(400).json({ error: "Only approved campaigns can be turned off/on" });
        }
        campaign.isActive = !campaign.isActive;
        await campaign.save();
        return res.status(200).json({ campaign, isActive: campaign.isActive });
    } catch (err) {
        console.error("[toggleCampaignActive]", err);
        return res.status(500).json({ error: "Failed to update campaign" });
    }
};

/** Candidate: delete own campaign */
export const deleteCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);
        if (!user || user.role !== "candidate") {
            return res.status(403).json({ error: "Candidate only" });
        }
        const candidate = await Candidate.findOne({ voter: user._id });
        if (!candidate) return res.status(404).json({ error: "Candidate profile not found" });
        const { campaignId } = req.params;
        const campaign = await Campaign.findOne({ _id: campaignId, candidate: candidate._id });
        if (!campaign) return res.status(404).json({ error: "Campaign not found" });
        await Campaign.findByIdAndDelete(campaignId);
        return res.status(200).json({ message: "Campaign deleted" });
    } catch (err) {
        console.error("[deleteCampaign]", err);
        return res.status(500).json({ error: "Failed to delete campaign" });
    }
};

/** Voter: remove like */
export const unlikePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { campaignId } = req.params;
        const campaign = await Campaign.findOne({ _id: campaignId, status: "approved" });
        if (!campaign) return res.status(404).json({ error: "Post not found or not approved" });
        campaign.likes = campaign.likes.filter((l) => l.voter && l.voter.toString() !== userId);
        await campaign.save();
        return res.status(200).json({ liked: false, likeCount: campaign.likes.length });
    } catch (err) {
        console.error("[unlikePost]", err);
        return res.status(500).json({ error: "Failed to remove like" });
    }
};
