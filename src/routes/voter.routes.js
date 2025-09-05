import {Router} from "express";
import mongoose from "mongoose";
import { changePassword, getProfile, loginUser, registerUser } from "../controllers/voter.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const voterRouter = Router();

voterRouter.route('/register').post(registerUser)
voterRouter.route('/login').post(loginUser)
voterRouter.route('/profile').get(verifyJWT,getProfile)
voterRouter.route('/change-password').post(verifyJWT,changePassword)

export default voterRouter