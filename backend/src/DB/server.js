import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        const connectionInstance = 
        await mongoose.connect(`${process.env.MONGODB_URL}/VotingAppDB`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
   }
   catch (error) {
        console.log("Error Connecting",error);
        process.exit(1);//give instance of the process
    }
}

export default connectDB