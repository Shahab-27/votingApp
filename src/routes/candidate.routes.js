import {Router} from "express";
import mongoose from "mongoose";
// import { changePassword, getProfile, loginUser, registerUser } from "../controllers/voter.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/registerCandidate').post(registerUser)
router.route('/loginCandidate').post(loginUser)
router.route('/profile').get(verifyJWT,getProfile)
router.route('/change-password').post(verifyJWT,changePassword)

export default router