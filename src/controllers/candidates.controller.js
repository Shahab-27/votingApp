import express from "express";
import candidate from "../models/candidates.model.js";
import mongoose from "mongoose";
import voter from "../models/voter.model.js";

const checkAdminRole = async (userId) => {
    const user = await voter.findById(userId);
    if (user.role === "admin") {
        return true;
    } else {
        return false;
    }
}


const registerCandidate = async (req, res) => {
    try {
        // check if the user is Admin
        const { data } = req.body
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({
                error: "User is not Admin"
            })
        }

        const newCandidate = await new candidate(data).save();
        if (newCandidate) {
            return res.status(200).json({
                message: "Data Saved Successfully"
            })
        }
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const modifyCandidate = async (req, res) => {
    try {
        const { data } = req.body;
        const id = req.params.candidateID;
        const isAdmin = checkAdminRole(id);

        if (!isAdmin) {
            return res.status(403).json({
                error: "The user does not have Admin rights"
            })
        }
        const newCandidateData = req.body;
        const response = await candidate.findByIdAndUpdate(id, newCandidateData, {
            return: true,
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

        if (!checkAdminRole(id)) {
            return res.status(500).json({
                error: "User doesn't have Admin rights"
            })
        }

        const response = await candidate.findByIdAndDelete(id);

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
    //only User can Voter
    try {
        const candidateId = req.params.candidateID
        const voterId = req.user.id;
        if (checkAdminRole(voterId)) {
            return res.status(500).json({
                message: "Admin has not rights for voting"
            })
        }


        const voterData = await voter.findById(voterId);
        const CandidateData = await candidate.findById(CandidateId);

        if (voterData.isVoted) {
            return res.status(500).json({
                error: "Multiple Votes are not allowed,You have already Voted."
            })
        }

        voterData.isVoted = true;
        await voterData.save()

        CandidateData.votes.push({ voters: voterId })
        CandidateData.voteCount++;

        await CandidateData.save();

        return res.status(200).json({
            message: 'Vote recorded successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: "Internal server Error"
        })
    }
}

const countVote = async (req, res) => {
    try {
        const candidateId = candidate.findById(req.user.id).sort({ voteCount: 'desc' });

        if (!candidateId) {
            return res.send(400).json({
                error: "Candidate not found"
            })
        }

        const voterRecord = candidate.map((val) => {
            return {
                Name: val.name,
                Party: val.party,
                Count: val.voteCount
            }
        })

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const getAllCandidates = async(req,res) => {
     try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}