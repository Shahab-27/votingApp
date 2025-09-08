import {Router} from "express";
import mongoose from "mongoose";
import { registerCandidate, modifyCandidate,
    deleteCandidate,giveVote,countVote,getAllCandidates
 } from "../controllers/candidates.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { getProfile } from "../controllers/voter.controller.js";

const candidatesRouter = Router();

candidatesRouter.route('/registerCandidate').post(registerCandidate)
candidatesRouter.route('/candidateprofile').get(verifyJWT,getProfile)
candidatesRouter.route('/:candidateID').put(verifyJWT,modifyCandidate)
candidatesRouter.route('/:candidateID').delete(verifyJWT,deleteCandidate)
candidatesRouter.route('/vote/:candidateID').get(verifyJWT,giveVote)
candidatesRouter.route('/vote/count').get(countVote)
candidatesRouter.route('allCandidates').get(getAllCandidates)
export default candidatesRouter
