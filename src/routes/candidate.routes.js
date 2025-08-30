import {Router} from "express";
import mongoose from "mongoose";
// import { registerCandidate, getProfile, loginUser, registerUser } from "../controllers/voter.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { getProfile } from "../controllers/voter.controller.js";

const router = Router();

router.route('/registerCandidate').post(registerCandidate)
router.route('/loginCandidate').post(loginCandidate)
router.route('/profile').get(verifyJWT,getProfile)
router.route('/:candidateID').put(verifyJWT,modifyCandidate)
router.route('/:candidateID').delete(verifyJWT,deleteCandidate)
router.route('/vote/:candidateID').get(verifyJWT,giveVote)
router.route('/vote/count').get(countVote)
router.route('allCandidates').get(getAllCandidates)
export default router