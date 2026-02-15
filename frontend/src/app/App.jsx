import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ChangePassword from "../pages/ChangePassword";
import Profile from "../pages/Profile";
import Candidates from "../pages/Candidates";
import Vote from "../pages/Vote";
import AdminDashboard from "../pages/AdminDashboard";
import CandidatePayment from "../pages/CandidatePayment";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Candidates />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/candidates" element={<Candidates />} />

            {/* Protected routes */}
            <Route
                path="/change-password"
                element={
                    <ProtectedRoute role={["voter", "candidate", "admin"]}>
                        <ChangePassword />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute role={["voter", "candidate"]}>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vote"
                element={
                    <ProtectedRoute role={["voter", "candidate"]}>
                        <Vote />
                    </ProtectedRoute>
                }
            />

            {/* Admin protected routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Candidate payment (public, uses cookie on backend) */}
            <Route path="/candidate-payment" element={<CandidatePayment />} />
            <Route path="/candidate-payment/success" element={<CandidatePayment />} />
            <Route path="/candidate-payment/cancelled" element={<CandidatePayment />} />

            {/* Fallback */}
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default AppRoutes;
