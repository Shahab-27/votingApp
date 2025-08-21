import {Router} from "express";
import mongoose from "mongoose";
import { changePassword, getProfile, loginUser, registerUser } from "../controllers/voter.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/profile').post(getProfile,verifyJWT)
router.route('/change-password').post(changePassword,verifyJWT)

export default router