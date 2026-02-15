import { Router } from "express";
import mongoose from "mongoose";
import {
  changePassword,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  listPendingCandidateApprovals,
  approveCandidateUser,
  disapproveCandidateUser,
  resubmitCandidateApprovalRequest,
} from "../controllers/voter.controller.js";
import { uploadAadhaarDoc } from "../controllers/upload.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { uploadSingle, uploadAadhaarSingle, logUploadRequest } from "../middlewares/upload.middleware.js";
import { confirmCandidateCheckoutSession, createCandidateCheckoutSession } from "../controllers/payments.controller.js";

const voterRouter = Router();

voterRouter.route("/register").post(registerUser);
voterRouter.route("/login").post(loginUser);
voterRouter.route("/logout").post(logoutUser);
voterRouter.route("/voterprofile").get(verifyJWT, getProfile);
voterRouter.route("/change-password").post(verifyJWT, changePassword);
voterRouter.route("/verify-email").post(verifyJWT, verifyEmail);
voterRouter.route("/resend-verification-email").post(verifyJWT, resendVerificationEmail);
voterRouter.route("/forgot-password").post(forgotPassword);
voterRouter.route("/reset-password").post(resetPassword);

// Admin approval flow for candidate users
voterRouter.route("/admin/candidate-approvals").get(verifyJWT, listPendingCandidateApprovals);
voterRouter.route("/admin/candidates/:userId/approve").post(verifyJWT, approveCandidateUser);
voterRouter.route("/admin/candidates/:userId/disapprove").post(verifyJWT, disapproveCandidateUser);

// Stripe payment flow (candidate registration fee)
voterRouter.route("/payments/candidate/checkout").post(verifyJWT, createCandidateCheckoutSession);
voterRouter.route("/payments/candidate/confirm").post(verifyJWT, confirmCandidateCheckoutSession);

// Candidate: resubmit approval request after rejection
voterRouter.route("/candidate/approval/resubmit").post(verifyJWT, resubmitCandidateApprovalRequest);

// Aadhaar upload (image/pdf) via Cloudinary
voterRouter
  .route("/upload-aadhaar")
  .post(logUploadRequest, uploadAadhaarSingle, uploadAadhaarDoc);

export default voterRouter;