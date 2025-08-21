import express from "express";
import mongoose from "mongoose";
import voter from "../models/voter.model";
import {generateAccessToken} from "./utils/generateAccessToken.utils.js"

const registerUser = async (req, res, next) => {
    try {
        const data = req.body;
        //  check user is not a admin
        const isAdminExist = await voter.exists({ role: "admin" })
        if (data.role == "admin" && isAdminExist) {
            return res.status(400).json({
                error: "Admin already exists"
            })
        }
        //  aadhaar No is 12 digits
        if (data.aadhaarNo.length === 12) {
            return res.status(400).json({
                error: "Aadhaar No already exist"
            })
        }
        //  check whether the user with same aadhaarNo exist
        const userExist = await voter.exists({ aadhaarNo: data.aadhaarNo });

        if (userExist) {
            return res.status(400).json({
                error: "User with same aadhaar exists"
            })
        }

        // create new User
        //  option 1 : const newUser = await voter.create(data); 
        const newUser = await new voter(data).save();

        // Why newUser.id instead of newUser._id ?? 

        // newUser._id → MongoDB’s ObjectId type.

        // newUser.id → Same value but automatically converted to a string by Mongoose.

        const payload = {
            id: newUser.id
        }

        // generating token
        const token = generateAccessToken(payload)

        res.status(200).json({
            UserData: newUser, token: token
        })

    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const loginUser = async(req,res,next) =>{
    try {
         const {aadhaarNo,password} = req.body

    // check aadhaarNo or password is correct
    if(!(aadhaarNo || password)){
        return res.status(400).json({
            error : "Aadhaar or password is not valid"
        })
    }

    // find the user by aadhaarNo
    const user = await voter.findOne({aadhaarNo})

    if(!(user || isPasswordCorrect(password) )){
        return res.send(400).json({
            error: "Invalid AadhaarNo or password"
        })
    }

       // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
    } catch (error) {
         res.status(500).json({ error: 'Internal Server Error' });
    }
   
}



export { registerUser,
    loginUser } 