import mongoose, { Schema } from "mongoose";
import voter from "./voter.model.js";

const candidateSchema = new Schema({
    voter: {
        type: Schema.Types.ObjectId,
        ref: voter,
    },
    name: {
        type: String,
        required: true,
    },
    // Optional demographic / contact fields
    age: {
        type: Number,
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    // Cloudinary image URLs (candidate + party symbols)
    candidateImage: {
        type: String,
    },
    partyImage: {
        type: String,
    },
    votes: [
        {
            voter: {
                type: Schema.Types.ObjectId,
                ref: voter
            },
            VotedAt: {
                type: Date,
                default: Date.now() 
            }
        }

    ],
    voteCount : {
        type : Number,
        default : 0
    }
}, {
    timestamps: true
})

const candidate = mongoose.model("candidate", candidateSchema);

export default candidate