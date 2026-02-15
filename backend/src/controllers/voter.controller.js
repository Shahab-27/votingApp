import express from "express";
import mongoose from "mongoose";
import voter from "../models/voter.model.js";
import Candidate from "../models/candidates.model.js";
import generateToken from "../utils/generateToken.utils.js";
import { sendCandidateVerificationEmail, sendResetPasswordEmail } from "../utils/mailjet.js";

const checkAdminRole = async (userId) => {
    const user = await voter.findById(userId).select("role");
    return user?.role === "admin";
};

const registerUser = async (req, res, next) => {
    try {
        const data = req.body.data;
        console.log("[registerUser] Incoming data", {
            username: data?.username,
            aadhaarNo: data?.aadhaarNo,
            role: data?.role,
            email: data?.email,
        });


        //  aadhaar No is 12 digits
        if (!data.aadhaarNo || !/^\d{12}$/.test(data.aadhaarNo)) {
            return res.status(400).json({
                error: "Aadhaar number is invalid"
            });
        }

        // ✅ Enforce max 2 admins in the system
        if (data.role === "admin") {
            const adminCount = await voter.countDocuments({ role: "admin" });
            console.log("[registerUser] Current admin count", adminCount);
            if (adminCount >= 2) {
                return res.status(400).json({
                    error: "Maximum number of admins reached (2). You cannot register more admins."
                });
            }
        }

        // Email required for all roles
        if (!data.email || !String(data.email).trim()) {
            return res.status(400).json({
                error: "Email is required"
            });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(data.password)) {
            return res.status(400).json({
                error: "Password must be at least 6 characters and contain letters and numbers"
            });
        }


        //  check whether the user with same aadhaarNo exist
        const userExist = await voter.exists({ aadhaarNo: data.aadhaarNo });
        console.log("[registerUser] Aadhaar exists?", !!userExist);
        if (userExist) {
            console.log("[registerUser] Blocking register: duplicate Aadhaar");
            return res.status(400).json({
                error: "User with same aadhaar exists"
            })
        }

        // If candidate, prepare email verification code
        let verificationCode = null;
        if (data.role === "candidate") {
            verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            data.emailVerificationCode = verificationCode;
            data.emailVerified = false;
            data.isApproved = false;
            data.approvalStatus = "pending";
            data.paymentStatus = "unpaid";
        }

        // create new User (defaults applied here)
        let newUser;
        try {
            newUser = await new voter(data).save();
        } catch (err) {
            // Handle duplicate username / aadhaar nicely instead of generic 500
            if (err.code === 11000) {
                console.error("[registerUser] Duplicate key error", err.keyValue);
                return res.status(400).json({
                    error: "Username or Aadhaar already exists"
                });
            }
            throw err;
        }
        console.log("[registerUser] New user created", {
            id: newUser.id,
            aadhaarNo: newUser.aadhaarNo,
            role: newUser.role
        });

        // Send verification email for candidates (best-effort)
        if (newUser.role === "candidate" && newUser.email && verificationCode) {
            try {
                await sendCandidateVerificationEmail(newUser.email, verificationCode);
                console.log("[registerUser] Candidate verification email sent via Mailjet");
            } catch (err) {
                console.error("[registerUser] Failed to send candidate verification email", err);
            }
        }

        const payload = {
            id: newUser.id
        }

        // generating token
        const token = generateToken(payload)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log("[registerUser] Registration complete, response sent", { userId: newUser.id, role: newUser.role });
        res.status(200).json({
            UserData: newUser,
            token: token
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const loginUser = async (req, res, next) => {
    try {
        const { aadhaarNo, password } = req.body

        // check aadhaarNo or password is correct
        if (!aadhaarNo) {
            return res.status(400).json({
                error: "Aadhaar is not valid"
            })
        }
        if (!password) {
            return res.status(400).json({
                error: "Password is not valid"
            })
        }


        // find the user by aadhaarNo
        const user = await voter.findOne({ aadhaarNo })

        if (!user) {
            return res.status(400).json({ error: "Invalid Aadhaar" });
        }

        const isValidPassword = await user.isPasswordCorrect(password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid Password" });
        }


        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // Set token in HTTP-only cookie (sent automatically with requests)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        console.log("[loginUser] Login success, response sent", { userId: user.id, role: user.role });
        res.json({
            token,
            message: "User Logged In successfully",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

// for profile
// Profile route
const getProfile = async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await voter.findById(userId).select("-password");
        console.log("[getProfile] Profile fetched for user", userId);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body

        // check old/new password is not empty
        if (!(oldPassword && newPassword)) {
            return res.status(400).json({
                error: "Old or New Password filed is empty"
            })
        }
        // check if user doesn't exist or password does not match
        const user = await voter.findById(userId);
        if (!user) return res.status(400).json({
            error: "User does not exist"
        })

        const verifyPassword = await user.isPasswordCorrect(oldPassword);

        if (!(verifyPassword)) {
            return res.status(400).json({
                error: "Password entered is not correct "
            })
        }
        // assign the pswrd to the password field

        user.password = newPassword;
        await user.save();

        console.log("[changePassword] Password updated successfully for user", userId);
        res.status(200).json({
            message: "Password Updated Successfully"
        })
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error"
        })
    }

}

const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out" });
};

const verifyEmail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Verification code is required" });
        }

        const user = await voter.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role !== "candidate") {
            return res.status(400).json({ error: "Email verification is only for candidates" });
        }

        if (!user.emailVerificationCode) {
            return res.status(400).json({ error: "No verification code found for this user. Please request a new code." });
        }

        if (user.emailVerificationCode !== code) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        user.emailVerified = true;
        // After email verification, candidate still needs admin approval
        if (!user.approvalStatus) user.approvalStatus = "pending";
        user.isApproved = user.approvalStatus === "approved";
        user.emailVerificationCode = null;
        await user.save();

        console.log("[verifyEmail] Email verified successfully for user", userId);
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("[verifyEmail] Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !String(email).trim()) {
            return res.status(400).json({ error: "Email is required" });
        }
        console.log("[forgotPassword] Request for email", email);
        const user = await voter.findOne({ email: String(email).trim().toLowerCase() });
        if (!user) {
            console.log("[forgotPassword] No user found for email, returning generic success");
            return res.status(200).json({ message: "If an account exists with this email, you will receive an OTP." });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordCode = code;
        user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        console.log("[forgotPassword] OTP saved for user", user.id, "expires at", user.resetPasswordExpiresAt);
        try {
            await sendResetPasswordEmail(user.email, code);
            console.log("[forgotPassword] Reset OTP email sent via Mailjet to", user.email);
        } catch (err) {
            console.error("[forgotPassword] Failed to send email", err);
            return res.status(500).json({ error: "Failed to send OTP email. Try again later." });
        }
        console.log("[forgotPassword] Response sent - OTP requested for email");
        res.status(200).json({ message: "If an account exists with this email, you will receive an OTP." });
    } catch (error) {
        console.error("[forgotPassword] Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: "Email, OTP code and new password are required" });
        }
        console.log("[resetPassword] Request for email", email);
        const user = await voter.findOne({ email: String(email).trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or OTP." });
        }
        if (!user.resetPasswordCode || !user.resetPasswordExpiresAt) {
            return res.status(400).json({ error: "No OTP requested or OTP expired. Please request a new one." });
        }
        if (new Date() > user.resetPasswordExpiresAt) {
            user.resetPasswordCode = null;
            user.resetPasswordExpiresAt = null;
            await user.save();
            return res.status(400).json({ error: "OTP expired. Please request a new one." });
        }
        if (user.resetPasswordCode !== String(code).trim()) {
            return res.status(400).json({ error: "Invalid OTP." });
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                error: "Password must be at least 6 characters and contain letters and numbers"
            });
        }
        user.password = newPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpiresAt = null;
        await user.save();
        console.log("[resetPassword] Password reset successfully, response sent", { userId: user.id });
        res.status(200).json({ message: "Password updated successfully. You can log in with your new password." });
    } catch (error) {
        console.error("[resetPassword] Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Resend candidate verification code (for logged-in candidates only)
const resendVerificationEmail = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role !== "candidate") {
            return res.status(400).json({ error: "Only candidates can request verification codes" });
        }
        if (user.emailVerified) {
            return res.status(400).json({ error: "Email is already verified" });
        }
        if (!user.email) {
            return res.status(400).json({ error: "No email address on file" });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = code;
        await user.save();

        try {
            await sendCandidateVerificationEmail(user.email, code);
            console.log("[resendVerificationEmail] Verification email resent via Mailjet for user", userId);
        } catch (err) {
            console.error("[resendVerificationEmail] Failed to send email", err);
            return res.status(500).json({ error: "Failed to send verification email. Try again later." });
        }

        res.status(200).json({ message: "Verification code resent to your email." });
    } catch (error) {
        console.error("[resendVerificationEmail] Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Admin: list candidate users awaiting approval (email verified + pending)
const listPendingCandidateApprovals = async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: "Admin only." });

        const pending = await voter
            .find({
                role: "candidate",
                paymentStatus: "paid",
                emailVerified: true,
                approvalStatus: "pending",
            })
            .select("-password -emailVerificationCode -resetPasswordCode -resetPasswordExpiresAt");

        return res.status(200).json({ candidates: pending });
    } catch (error) {
        console.error("[listPendingCandidateApprovals] Error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const approveCandidateUser = async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: "Admin only." });

        const candidateUserId = req.params.userId;
        const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim() : "";
        const user = await voter.findById(candidateUserId);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.role !== "candidate") return res.status(400).json({ error: "Target user is not a candidate" });
        if (!user.emailVerified) return res.status(400).json({ error: "Candidate email is not verified yet" });

        user.approvalStatus = "approved";
        user.isApproved = true;
        user.approvalRemarks = remarks || null;
        user.approvalReviewedAt = new Date();
        user.approvalReviewedBy = req.user.id;
        await user.save();

        return res.status(200).json({ message: "Candidate approved" });
    } catch (error) {
        console.error("[approveCandidateUser] Error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const disapproveCandidateUser = async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: "Admin only." });

        const candidateUserId = req.params.userId;
        const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim() : "";
        if (!remarks) return res.status(400).json({ error: "Remarks are required when rejecting a candidate" });
        const user = await voter.findById(candidateUserId);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.role !== "candidate") return res.status(400).json({ error: "Target user is not a candidate" });
        if (!user.emailVerified) return res.status(400).json({ error: "Candidate email is not verified yet" });

        user.approvalStatus = "rejected";
        user.isApproved = false;
        user.approvalRemarks = remarks;
        user.approvalReviewedAt = new Date();
        user.approvalReviewedBy = req.user.id;
        await user.save();

        return res.status(200).json({ message: "Candidate rejected" });
    } catch (error) {
        console.error("[disapproveCandidateUser] Error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Candidate: resubmit approval request after rejection
const resubmitCandidateApprovalRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await voter.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.role !== "candidate") return res.status(403).json({ error: "Candidate only." });
        if (!user.emailVerified) return res.status(400).json({ error: "Verify your email first" });
        if (user.paymentStatus !== "paid") return res.status(400).json({ error: "Complete payment first" });
        if (user.approvalStatus !== "rejected") {
            return res.status(400).json({ error: "You can only resubmit after rejection" });
        }

        const aadhaarDocUrl = typeof req.body?.aadhaarDocUrl === "string" ? req.body.aadhaarDocUrl.trim() : "";
        if (aadhaarDocUrl) user.aadhaarDocUrl = aadhaarDocUrl;

        user.approvalStatus = "pending";
        user.isApproved = false;
        user.approvalRemarks = null;
        user.approvalReviewedAt = null;
        user.approvalReviewedBy = null;
        await user.save();

        return res.status(200).json({ message: "Approval request resubmitted" });
    } catch (error) {
        console.error("[resubmitCandidateApprovalRequest] Error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export {
    registerUser,
    loginUser,
    getProfile,
    changePassword,
    logoutUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    listPendingCandidateApprovals,
    approveCandidateUser,
    disapproveCandidateUser,
    resubmitCandidateApprovalRequest
} 