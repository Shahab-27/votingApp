import {Router} from "express";
import mongoose from "mongoose";
import { changePassword, getProfile, loginUser, registerUser } from "../controllers/voter.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/profile').post(verifyJWT,getProfile)
router.route('/change-password').post(verifyJWT,changePassword)

export default router