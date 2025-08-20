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
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['voter', 'admin'],
            default: 'voter'
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