import { Router } from "express";
import { registerCandidate, modifyCandidate, deleteCandidate, giveVote, removeVote, countVote, getAllCandidates, uploadImage, upsertSelfCandidateProfile, getSelfCandidateProfile, uploadSelfCandidateImage } from "../controllers/candidates.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const candidatesRouter = Router();

// Specific routes before parametric ones
candidatesRouter.route("/upload-image").post(verifyJWT, uploadSingle, uploadImage);
candidatesRouter.route("/candidate/upload-image").post(verifyJWT, uploadSingle, uploadSelfCandidateImage);
candidatesRouter.route("/registerCandidate").post(verifyJWT, registerCandidate);
candidatesRouter.route("/candidate/self").get(verifyJWT, getSelfCandidateProfile).post(verifyJWT, upsertSelfCandidateProfile);
candidatesRouter.route("/allCandidates").get(getAllCandidates);
candidatesRouter.route("/vote/count").get(countVote);
candidatesRouter.route("/vote/remove").post(verifyJWT, removeVote);
candidatesRouter.route("/vote/:candidateID").get(verifyJWT, giveVote);
candidatesRouter.route("/:candidateID").put(verifyJWT, modifyCandidate).delete(verifyJWT, deleteCandidate);

export default candidatesRouter;
