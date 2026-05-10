/**
 * Shared seed logic: add dummy votes to candidates so charts look good.
 * Uses the existing mongoose connection (no connect/disconnect).
 * Safe to call on every backend start: only seeds when candidates have no votes.
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import voter from "../src/models/voter.model.js";
import Candidate from "../src/models/candidates.model.js";

const MIN_VOTES_PER_CANDIDATE = 5;
const MAX_VOTES_PER_CANDIDATE = 28;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("DummyPass1", 10);

export async function runSeedIfNeeded() {
    if (mongoose.connection.readyState !== 1) return;
    const Voter = voter;
    const candidates = await Candidate.find({}).lean();
    if (candidates.length === 0) return;

    const votesToAddPerCandidate = candidates.map((c) => {
        const current = c.voteCount || 0;
        if (current === 0) {
            return MIN_VOTES_PER_CANDIDATE + Math.floor(Math.random() * (MAX_VOTES_PER_CANDIDATE - MIN_VOTES_PER_CANDIDATE + 1));
        }
        return 0;
    });
    const totalDummyVotes = votesToAddPerCandidate.reduce((a, b) => a + b, 0);
    if (totalDummyVotes === 0) return;

    const existingAadhaar = new Set((await Voter.find({}).select("aadhaarNo").lean()).map((u) => u.aadhaarNo));
    const baseAadhaar = 200000000000;
    const dummyVoters = [];
    for (let i = 0; i < totalDummyVotes; i++) {
        let aadhaar = baseAadhaar + i;
        while (existingAadhaar.has(aadhaar)) aadhaar += 1000000;
        existingAadhaar.add(aadhaar);
        dummyVoters.push({
            username: `dummy_voter_${Date.now()}_${i}`,
            password: DUMMY_PASSWORD_HASH,
            aadhaarNo: aadhaar,
            email: `dummy${i}@seed.local`,
            role: "voter",
            isVoted: true,
        });
    }

    const inserted = await Voter.insertMany(dummyVoters);
    const voterIds = inserted.map((v) => v._id);

    let idx = 0;
    for (let c = 0; c < candidates.length; c++) {
        const toAdd = votesToAddPerCandidate[c];
        if (toAdd === 0) continue;
        const candidateId = candidates[c]._id;
        const voteRefs = voterIds.slice(idx, idx + toAdd).map((id) => ({
            voter: id,
            VotedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }));
        idx += toAdd;
        await Candidate.updateOne(
            { _id: candidateId },
            { $push: { votes: { $each: voteRefs } }, $inc: { voteCount: toAdd } }
        );
    }
    console.log(`  [seed] Added ${totalDummyVotes} dummy votes across ${candidates.length} candidate(s).`);
}
