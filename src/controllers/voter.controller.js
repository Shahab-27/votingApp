import express from "express";
import mongoose from "mongoose";
import voter from "../models/voter.model";
import { generateAccessToken } from "./utils/generateAccessToken.utils.js"

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
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { aadhaarNo, password } = req.body

        // check aadhaarNo or password is correct
        if (!(aadhaarNo || password)) {
            return res.status(400).json({
                error: "Aadhaar or password is not valid"
            })
        }

        // find the user by aadhaarNo
        const user = await voter.findOne({ aadhaarNo })

        if (!(user || isPasswordCorrect(password))) {
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
        res.json({ token })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

// for profile
// Profile route
const getProfile = async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body

        // check old/new password is not empty
        if (!(oldPassword || newPassword)) {
            return res.status(400).json({
                error: "Old or New Password filed is empty"
            })
        }
        // check if user doesn't exist or password does not match
        const user = voter.findById(userId);
        if (!user) return res.send(400).json({
            error: "User does not exist"
        })

        const verifyPassword = await isPasswordCorrect(password);

        if (!(verifyPassword)) {
            return res.status.json({
                error: "Password entered is not correct "
            })
        }
        // assign the pswrd to the password field

        user.password = newPassword;
        await user.save();

        res.send(200).json({
            message : "Password Updated Successfully"
        })
    } catch (error) {
        res.status(500).json({
            error : "Internal Server Error"
        })
    }

}





export {
    registerUser,
    loginUser, getProfile, changePassword
} 