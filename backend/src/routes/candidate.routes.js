import { Router } from "express";
import { registerCandidate, modifyCandidate, deleteCandidate, giveVote, countVote, getAllCandidates } from "../controllers/candidates.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const candidatesRouter = Router();

// Specific routes before parametric ones
candidatesRouter.route("/registerCandidate").post(verifyJWT, registerCandidate);
candidatesRouter.route("/allCandidates").get(getAllCandidates);
candidatesRouter.route("/vote/count").get(countVote);
candidatesRouter.route("/vote/:candidateID").get(verifyJWT, giveVote);
candidatesRouter.route("/:candidateID").put(verifyJWT, modifyCandidate).delete(verifyJWT, deleteCandidate);

export default candidatesRouter;
