import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const voterSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,

        },
        aadhaarNo: {
            type: Number,
            required: true,
            unique: true
        },
        email: {
            type: String,
        },
        role: {
            type: String,
            enum: ['voter', 'admin', 'candidate'],
            default: 'voter'
        },
        aadhaarDocUrl: {
            type: String,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationCode: {
            type: String,
        },
        resetPasswordCode: {
            type: String,
        },
        resetPasswordExpiresAt: {
            type: Date,
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        approvalRemarks: {
            type: String,
        },
        approvalReviewedAt: {
            type: Date,
        },
        approvalReviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "voter",
        },
        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid"],
            default: "unpaid",
        },
        stripeCheckoutSessionId: {
            type: String,
        },
        stripePaymentIntentId: {
            type: String,
        },
        stripeChargeId: {
            type: String,
        },
        stripeReceiptUrl: {
            type: String,
        },
        isVoted: {
            type: Boolean,
            default: false
        }
    }

    ,

    {
        timestamps: true
    }
)
// we dont use arrow f(x) because they dont have refrence of "this" object
voterSchema.pre('save', async function (next) {
    // hash the password if modified or its new
    const person = this
    if (!person.isModified('password')) return next()

    try {
        const hashedPassword = await bcrypt.hash(person.password, 10);
        person.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
})

voterSchema.methods.isPasswordCorrect = async function (userPassword) {
    try {
        return await bcrypt.compare(userPassword, this.password);
    } catch (error) {
        throw error;
    }
}


const voter = mongoose.model("voter", voterSchema);

export default voter;