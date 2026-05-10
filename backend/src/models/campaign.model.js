import mongoose, { Schema } from "mongoose";
import Candidate from "./candidates.model.js";
import voter from "./voter.model.js";

const campaignSchema = new Schema(
    {
        candidate: {
            type: Schema.Types.ObjectId,
            ref: Candidate,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        caption: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        reviewedBy: { type: Schema.Types.ObjectId, ref: voter },
        reviewedAt: { type: Date },
        approvalRemarks: { type: String },
        likes: [
            {
                voter: { type: Schema.Types.ObjectId, ref: voter },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
