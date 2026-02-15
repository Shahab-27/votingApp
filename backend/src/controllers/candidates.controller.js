import express from "express";
import Candidate from "../models/candidates.model.js";
import mongoose from "mongoose";
import voter from "../models/voter.model.js";
import cloudinary from "../utils/cloudinary.js";

const checkAdminRole = async (userId) => {
    const user = await voter.findById(userId);
    if (user.role === "admin") {
        return true;
    } else {
        return false;
    }
}

const upsertSelfCandidateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.role !== "candidate") {
            return res.status(403).json({ error: "Only candidates can complete candidate profile" });
        }
        if (!user.emailVerified) {
            return res.status(400).json({ error: "Verify your email before completing candidate registration" });
        }
        // Allow: (1) unpaid — fill details before payment; (2) paid + approved/rejected — update profile and resubmit for approval
        const isUnpaid = user.paymentStatus === "unpaid";
        const isPaidAndCanUpdate = user.paymentStatus === "paid" && (user.approvalStatus === "approved" || user.approvalStatus === "rejected");
        if (!isUnpaid && !isPaidAndCanUpdate) {
            if (user.paymentStatus !== "paid") {
                return res.status(400).json({ error: "Verify your email and complete candidate details before payment" });
            }
            return res.status(400).json({ error: "Your application is pending admin approval. You cannot edit until it is approved or rejected." });
        }

        const { name, party, address, age, mobile, candidateImage, partyImage } = req.body;

        if (!name || !party) {
            return res.status(400).json({ error: "Name and party are required" });
        }

        const payload = {
            voter: user._id,
            name,
            party,
            address: address || "N/A",
            age: age ? Number(age) : undefined,
            mobile: mobile || undefined,
        };
        if (candidateImage) payload.candidateImage = candidateImage;
        if (partyImage) payload.partyImage = partyImage;

        const candidate = await Candidate.findOneAndUpdate(
            { voter: user._id },
            payload,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // If paid and was approved/rejected, set back to pending for admin re-approval
        if (isPaidAndCanUpdate) {
            user.approvalStatus = "pending";
            user.isApproved = false;
            user.approvalRemarks = null;
            user.approvalReviewedAt = null;
            user.approvalReviewedBy = null;
            await user.save();
        }

        return res.status(200).json({ candidate });
    } catch (error) {
        console.error("[upsertSelfCandidateProfile] Error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getSelfCandidateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.role !== "candidate") return res.status(403).json({ error: "Candidate only" });

        const candidate = await Candidate.findOne({ voter: user._id });
        return res.status(200).json({ candidate: candidate || null });
    } catch (error) {
        console.error("[getSelfCandidateProfile] Error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const uploadSelfCandidateImage = async (req, res) => {
    try {
        const user = await voter.findById(req.user.id);
        if (!user || user.role !== "candidate") {
            return res.status(403).json({ error: "Only candidates can upload profile images" });
        }
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: "No image file provided." });
        }
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(dataUri, { folder: "voting-app" });
        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Image upload failed." });
    }
};

const registerCandidate = async (req, res) => {
    try {
        // check if the user is Admin
        const data = req.body;
        console.log("[registerCandidate] Incoming data", data);

        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            console.log("[registerCandidate] Blocked non-admin user", { userId: req.user.id });
            return res.status(403).json({
                error: "User is not Admin"
            });
        }

        const newCandidate = await new Candidate(data).save();
        console.log("[registerCandidate] New candidate created", {
            id: newCandidate.id,
            name: newCandidate.name,
            party: newCandidate.party,
        });

        if (newCandidate) {
            return res.status(200).json({
                message: "Data Saved Successfully",
                candidate: newCandidate,
            });
        }
    } catch (error) {
        console.log("[registerCandidate] Error", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const modifyCandidate = async (req, res) => {
    try {
       
        const Candidateid = req.params.candidateID;
        const isAdmin = await checkAdminRole(req.user.id);

        if (!isAdmin) {
            return res.status(403).json({
                error: "The user does not have Admin rights"
            })
        }
        const newCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(Candidateid, newCandidateData, {
            new: true, // returns the updated document
            runValidators: true
        });

        if (!response) {
            return res.status(403).json({
                error: "Updation Failed"
            })
        }
        console.log("Candidate data Updated successfully")
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }


}

const deleteCandidate = async (req, res) => {
    try {
        const id = req.params.candidateID;

        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({
                error: "User doesn't have Admin rights"
            });
        }

        const response = await Candidate.findByIdAndDelete(id);

        if (!response) {
            return res.status(404).json({
                error: "Candidate Not found"
            })
        }

        console.log("Candidate Deleted Successfully");
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}


const giveVote = async (req, res) => {
    //only User can be a  Voter
    try {
        const candidateId = req.params.candidateID;
        const voterId = req.user.id;
        const isAdmin = await checkAdminRole(voterId);

        // Only non-admin voters can vote
        if (isAdmin) {
            return res.status(403).json({
                message: "Admin has no rights for voting"
            });
        }


        const voterData = await voter.findById(voterId);
        const candidateData = await Candidate.findById(candidateId);

        if (!candidateData) {
            return res.status(404).json({
                error: "Candidate not found"
            });
        }

        if (voterData.isVoted) {
            return res.status(500).json({
                error: "Multiple Votes are not allowed,You have already Voted."
            })
        }

        voterData.isVoted = true;
        await voterData.save();

        candidateData.votes.push({ voter: voterId });
        candidateData.voteCount++;

        await candidateData.save();

        return res.status(200).json({
            message: 'Vote recorded successfully'
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: "Internal server Error"
        })
    }
}

const countVote = async (req, res) => {
    try {
        // Return all candidates with their vote counts, sorted by most votes
        const candidates = await Candidate.find({})
            .sort({ voteCount: "desc" })
            .select("name party voteCount");

        const voteRecord = candidates.map((val) => ({
            Name: val.name,
            Party: val.party,
            Count: val.voteCount,
        }));

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({}).select("name party candidateImage partyImage address age mobile voteCount");

        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const removeVote = async (req, res) => {
    try {
        const voterId = req.user.id;
        const isAdmin = await checkAdminRole(voterId);
        if (isAdmin) {
            return res.status(403).json({ message: "Admin cannot vote or remove vote." });
        }

        const voterData = await voter.findById(voterId);
        if (!voterData) {
            return res.status(404).json({ error: "Voter not found." });
        }
        if (!voterData.isVoted) {
            return res.status(400).json({ error: "You have not voted yet." });
        }

        const candidate = await Candidate.findOne({ "votes.voter": voterId });
        if (!candidate) {
            voterData.isVoted = false;
            await voterData.save();
            return res.status(200).json({ message: "Vote removed (record was inconsistent)." });
        }

        candidate.votes = candidate.votes.filter(
            (v) => String(v.voter) !== String(voterId)
        );
        candidate.voteCount = Math.max(0, candidate.voteCount - 1);
        await candidate.save();

        voterData.isVoted = false;
        await voterData.save();

        return res.status(200).json({ message: "Vote removed successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const uploadImage = async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ error: "Admin only." });
        }
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: "No image file provided." });
        }
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "voting-app",
        });
        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Image upload failed." });
    }
};

export {
    registerCandidate,
    modifyCandidate,
    deleteCandidate,
    giveVote,
    removeVote,
    countVote,
    getAllCandidates,
    uploadImage,
    upsertSelfCandidateProfile,
    getSelfCandidateProfile,
    uploadSelfCandidateImage
};