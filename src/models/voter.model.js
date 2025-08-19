import mongoose, { Schema } from "mongoose";

const voterSchema = new Schema(
    {
        username :{
            type : String,
            required : true,
            unique : true,
        },
        password : {
            type : String,
            required : true,

        },
        aadhaarNo : {
            type : Number,
            required : true,
            unique : true
        },
        isAdmin : {
            type : Boolean,
            enum : ['voter','admin'],
            default : 'voter'
        },
        isVoted : {
            type : Boolean,
            default : false
        }
    }

,

{
    timestamps: true
}
)


const voter = mongoose.model("voter", voterSchema);

export default voter;