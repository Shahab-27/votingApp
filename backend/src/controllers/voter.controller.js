import express from "express";
import mongoose from "mongoose";
import voter from "../models/voter.model.js";
import generateToken from "../utils/generateToken.utils.js"

const registerUser = async (req, res, next) => {
    try {
        const data = req.body.data;


        //  aadhaar No is 12 digits
        if (!data.aadhaarNo || !/^\d{12}$/.test(data.aadhaarNo)) {
            return res.status(400).json({
                error: "Aadhaar number is invalid"
            });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: "Password must be at least 6 characters and contain letters and numbers"
            });
        }


        //  check whether the user with same aadhaarNo exist
        const userExist = await voter.exists({ aadhaarNo: data.aadhaarNo });
        if (userExist) {
            return res.status(400).json({
                error: "User with same aadhaar exists"
            })
        }

        // create new User (defaults applied here)
        const newUser = await new voter(data).save();

        //  check user is not a second admin
        const isAdminExist = await voter.exists({ role: "admin" })
        if (newUser.role === "admin" && isAdminExist) {
            await voter.findByIdAndDelete(newUser._id);
            return res.status(400).json({
                error: "Admin already exists"
            })
        }

        const payload = {
            id: newUser.id
        }

        // generating token
        const token = generateToken(payload)

        res.status(200).json({
            UserData: newUser,
            token: token
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const loginUser = async (req, res, next) => {
    try {
        const { aadhaarNo, password } = req.body

        // check aadhaarNo or password is correct
        if (!aadhaarNo) {
            return res.status(400).json({
                error: "Aadhaar is not valid"
            })
        }
        if (!password) {
            return res.status(400).json({
                error: "Password is not valid"
            })
        }


        // find the user by aadhaarNo
        const user = await voter.findOne({ aadhaarNo })

        if (!user) {
            return res.status(400).json({ error: "Invalid Aadhaar" });
        }

        const isValidPassword = await user.isPasswordCorrect(password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid Password" });
        }


        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // return token as response
        res.json({
            token: token,
            message: "User Logged In successfully",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

// for profile
// Profile route
const getProfile = async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await voter.findById(userId).select("-password");;
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
        if (!(oldPassword && newPassword)) {
            return res.status(400).json({
                error: "Old or New Password filed is empty"
            })
        }
        // check if user doesn't exist or password does not match
        const user = await voter.findById(userId);
        if (!user) return res.status(400).json({
            error: "User does not exist"
        })

        const verifyPassword = await user.isPasswordCorrect(oldPassword);

        if (!(verifyPassword)) {
            return res.status(400).json({
                error: "Password entered is not correct "
            })
        }
        // assign the pswrd to the password field

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: "Password Updated Successfully"
        })
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error"
        })
    }

}





export {
    registerUser,
    loginUser, getProfile, changePassword
} 