import mongoose, { Schema } from "mongoose";
import voter from "./voter.model";

const candidateSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
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
    votes: [
        {
            user: {
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