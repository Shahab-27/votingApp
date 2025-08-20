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
        if (data.aadhaarNo.length === 12 && !isNaN(data.aadhaarNo)) {
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
        const newUser = await new voter(data).save();

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


export { registerUser } 